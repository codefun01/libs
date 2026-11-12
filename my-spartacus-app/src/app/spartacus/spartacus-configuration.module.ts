import { NgModule } from '@angular/core';
import { translationChunksConfig, translationsEn } from '@spartacus/assets';
import {
  FeaturesConfig,
  I18nConfig,
  OccConfig,
  provideConfig,
  provideConfigFactory,
  SiteContextConfig,
} from '@spartacus/core';
import {
  defaultCmsContentProviders,
  layoutConfigFactory,
  mediaConfig,
} from '@spartacus/storefront';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    provideConfigFactory(layoutConfigFactory),
    provideConfig(mediaConfig),
    ...defaultCmsContentProviders,
    provideConfig({
      backend: {
        occ: {
          baseUrl: 'https://localhost:9002',
          prefix: '/occ/v2/',
        },
      },
      context: {
        baseSite: ['electronics-spa'],
        currency: ['USD'],
        language: ['en'],
      },
      authentication: {
        client_id: 'client-side',
        client_secret: 'secret',
        // Endpoints are defined here at the root level of 'authentication'
        OAuthLibConfig: {
          scope: 'basic openid',
          responseType: 'code',
          // Update this line to point to the assets folder:
          redirectUri: 'https://localhost:4200/login/callback',
          useHttpBasicAuth: false,
        }
      }
    }),
    provideConfig({
      context: {
        baseSite: ['electronics-spa'],
        currency: ['USD'],
        language: ['en'],
      },
    }),
    provideConfig(<I18nConfig>{
      i18n: {
        resources: { en: translationsEn },
        chunks: translationChunksConfig,
        fallbackLang: 'en',
      },
    }),
    provideConfig(<FeaturesConfig>{
      features: {
        level: '221121.20',
      },
    }),
  ],
})
export class SpartacusConfigurationModule { }
