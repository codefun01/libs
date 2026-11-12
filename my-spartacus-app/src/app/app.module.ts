import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from '@spartacus/storefront';
import { SpartacusModule } from './spartacus/spartacus.module';
import { OAuthCallbackComponent } from './login-modal.component';
import { RouterModule } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';

@NgModule({
  imports: [StoreModule.forRoot({}), EffectsModule.forRoot([]), AppRoutingModule, SpartacusModule, 
 RouterModule.forRoot([
      { 
        path: '¸¸', 
        component: OAuthCallbackComponent,
        data: { cxCmsRouteContext: { disableCms: true } } 
      }
    ]),
    CommonModule
],
})
export class AppModule { }
