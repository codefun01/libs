import { Routes } from '@angular/router';
import { OAuthCallbackComponent } from './login-modal.component';

export const routes: Routes = [{ 
        path: 'login/callback', 
        component: OAuthCallbackComponent,
        
      }];
