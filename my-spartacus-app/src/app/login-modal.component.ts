import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-oauth-callback',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
      <h2>Authentication successful. Closing window...</h2>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('ng')
    this.route.queryParams.subscribe(params => {
      const authCode = params['code'];
      console.log(authCode,window.opener);
      if (authCode && window.opener) {
        // Target origin is explicitly defined for strict security
        const targetOrigin = window.location.origin;
        window.opener.postMessage({ type: 'OAUTH_CODE', code: authCode }, targetOrigin);
        
        // Close the popup window automatically
        window.close();
      }
    });
  }
}