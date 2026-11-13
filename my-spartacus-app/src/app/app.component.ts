import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions, AuthService, OCC_USER_ID_CURRENT, RoutingService, UserIdService } from '@spartacus/core';
import { StorefrontComponent } from '@spartacus/storefront';
import { OAuthService } from 'angular-oauth2-oidc';
import { OAuthPopupService } from './services/oauth.popup.service';

@Component({
  selector: 'app-root',
  imports: [StorefrontComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  protected readonly title = signal('my-spartacus-app');

  authService = inject(AuthService);
  private oAuthPopupService = inject(OAuthPopupService);
  isLogin: boolean = false;

  constructor() {
    this.authService.isUserLoggedIn().subscribe(isUserLogedIn => this.isLogin = isUserLogedIn)
  }


  async loginWithPopup() {
    await this.oAuthPopupService.loginWithPopup();
  }
    
}
