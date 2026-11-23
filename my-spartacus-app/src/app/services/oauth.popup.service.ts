import { Injectable, PLATFORM_ID, inject, DestroyRef, NgZone } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OAuthService } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';
import {
  AuthActions, AuthService, GlobalMessageService, GlobalMessageType,
  LoggerService, OCC_USER_ID_CURRENT, RoutingService, UserIdService,
} from '@spartacus/core';
import { filter, firstValueFrom, fromEvent, interval, map, merge } from 'rxjs';

interface PopupCallbackMessage {
  type: 'OAUTH_CALLBACK';
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}

@Injectable({ providedIn: 'root' })
export class OAuthPopupService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly oauthService = inject(OAuthService);
  private readonly store = inject(Store);
  private readonly userIdService = inject(UserIdService);
  private readonly globalMessages = inject(GlobalMessageService);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly authService = inject(AuthService);

  private popup: Window | null = null;

  async loginWithPopup(): Promise<boolean> {
    const win = this.document.defaultView;
    if (!win || !isPlatformBrowser(this.platformId)) return false;

    this.popup?.close();

    const popup = win.open('about:blank', 'sapLoginPopup', this.features(win));
    if (!popup) {
      // this.globalMessages.add(
      //   { raw: 'Popup blocked. Please allow popups for this site.' },
      //   GlobalMessageType.MSG_TYPE_ERROR
      // );
     this.authService.loginWithRedirect();
      return false;
    }
    this.popup = popup;

    try {
      popup.location.href = await (this.oauthService as any).createLoginUrl();

      const message$ = fromEvent<MessageEvent>(win, 'message').pipe(
        filter(e =>
          e.origin === win.location.origin &&
          e.source === popup &&
          e.data?.type === 'OAUTH_CALLBACK'),
        map(e => e.data as PopupCallbackMessage)
      );

      const closed$ = this.ngZone.runOutsideAngular(() => interval(500)).pipe(
        filter(() => popup.closed),
        map(() => null)
      );

      const result = await firstValueFrom(
        merge(message$, closed$).pipe(takeUntilDestroyed(this.destroyRef))
      );

      if (!result) return false; 
      if (result.error || !result.code) {
        throw new Error(result.errorDescription ?? result.error ?? 'No code returned');
      }

      const fragment = '?' + new URLSearchParams({
        code: result.code,
        state: result.state ?? '',
      });
      await this.oauthService.tryLoginCodeFlow({
        customHashFragment: fragment,
        preventClearHashAfterLogin: true,
      });

      if (!this.oauthService.hasValidAccessToken()) {
        throw new Error('Token exchange did not yield a valid access token');
      }

      this.userIdService.setUserId(OCC_USER_ID_CURRENT);
      this.store.dispatch(new AuthActions.Login());
      return true;
    } catch (e) {
      this.logger.error('OAuth popup login failed', e);
      this.globalMessages.add(
        { raw: 'Login failed. Please try again.' },
        GlobalMessageType.MSG_TYPE_ERROR
      );
      throw e;
    } finally {
      popup.close();
      this.popup = null;
    }
  }

  processPotentialPopupCallback(): Promise<void> {
    const win = this.document.defaultView;
    if (!win || !isPlatformBrowser(this.platformId)) return Promise.resolve();
    if (!win.opener || win.opener === win) return Promise.resolve();

    const p = new URLSearchParams(win.location.search);
    if (!p.has('code') && !p.has('error')) return Promise.resolve();

    const msg: PopupCallbackMessage = {
      type: 'OAUTH_CALLBACK',
      code: p.get('code') ?? undefined,
      state: p.get('state') ?? undefined,
      error: p.get('error') ?? undefined,
      errorDescription: p.get('error_description') ?? undefined,
    };
    win.opener.postMessage(msg, win.location.origin);
    win.close();

    return new Promise<void>(() => {});
  }

  private features(win: Window): string {
    const w = 500, h = 700;
    const left = win.screenX + (win.outerWidth - w) / 2;
    const top = win.screenY + (win.outerHeight - h) / 2;
    return `width=${w},height=${h},left=${left},top=${top}`;
  }
}