import { inject, NgModule, PLATFORM_ID, provideAppInitializer } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from '@spartacus/storefront';
import { SpartacusModule } from './spartacus/spartacus.module';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OAuthPopupService } from './services/oauth.popup.service';


@NgModule({
  imports: [StoreModule.forRoot({}), EffectsModule.forRoot([]), AppRoutingModule, SpartacusModule,

    CommonModule
  ],
  providers: [provideAppInitializer(() => {
      const authPopupService = inject(OAuthPopupService);
      return authPopupService.processPotentialPopupCallback();
    }),]
})
export class AppModule { }
