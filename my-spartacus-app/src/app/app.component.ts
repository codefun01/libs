import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions, AuthService, OCC_USER_ID_CURRENT, RoutingService, UserIdService } from '@spartacus/core';
import { StorefrontComponent } from '@spartacus/storefront';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  imports: [StorefrontComponent,NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  protected readonly title = signal('my-spartacus-app');
  private oauthService = inject(OAuthService);
  private router = inject(Router)

  authService = inject(AuthService);
  private store = inject(Store);
  private userIdService = inject(UserIdService);
  private messageListener: any;
  isLogin: boolean = false;

  constructor() {
    this.authService.isUserLoggedIn().subscribe(isUserLogedIn => this.isLogin = isUserLogedIn)
  }

  async loginWithPopup() {
    // 1. Bypass TypeScript's 'protected' modifier to manually generate the PKCE URL
    const url = await (this.oauthService as any).createLoginUrl();

    // 2. Open the popup manually
    const popup = window.open(url, 'sapLoginPopup', 'width=500,height=700');

    // Monitor if the user manually closes the popup to prevent memory leaks
    const popupMonitor = setInterval(() => {
      if (popup?.closed) {
        clearInterval(popupMonitor);
        window.removeEventListener('message', this.messageListener);
        console.log('Popup was closed by the user before completing login.');
      }
    }, 1000);

    // 3. Listen for the callback message from the popup window
    this.messageListener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;

      if (data && data.code) {
        // Clean up popup and listeners
        if (popup) popup.close();
        clearInterval(popupMonitor);
        window.removeEventListener('message', this.messageListener);

        try {
          // Ensure the fragment includes both code and state for the library to validate
          // Adjust this depending on exactly what your popup window posts back via postMessage
          const queryFragment = typeof data === 'string' ? data : `?code=${data.code}&state=${data.state}`;
          console.log(data);
          // 4. Pass the extracted query string to the library to fetch the access_token
          await this.oauthService.tryLoginCodeFlow({ customHashFragment: queryFragment });

          console.log('PKCE Flow Complete - Token Acquired!');

          // Refresh Spartacus state
          // this.authService.coreLogout();
          // window.location.reload();
          if (this.oauthService.hasValidAccessToken()) {
            this.userIdService.setUserId(OCC_USER_ID_CURRENT);
            this.store.dispatch(new AuthActions.Login());

            console.log('PKCE Flow Complete - Spartacus state updated!');
          }
        } catch (error) {
          console.error('Failed to complete PKCE token exchange:', error);
        }
      }
    };

    window.addEventListener('message', this.messageListener);
  }
  isLogedIn$ = this.authService.isUserLoggedIn();
}
