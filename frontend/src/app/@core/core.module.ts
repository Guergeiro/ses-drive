import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbAuthModule,
  NbPasswordAuthStrategy,
  NbAuthSimpleToken,
} from '@nebular/auth';
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import { of as observableOf } from 'rxjs';

import { throwIfAlreadyLoaded } from './module-import-guard';
import {
  AnalyticsService,
  LayoutService,
  PlayerService,
  SeoService,
  StateService,
} from './utils';

import { environment } from '../../environments/environment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../modules/auth/interceptors/auth.interceptor';
import { NB_AUTH_TOKEN_INTERCEPTOR_FILTER } from '@nebular/auth';
import { BaseInterceptor } from '../modules/auth/interceptors/base.interceptor';

export class NbSimpleRoleProvider extends NbRoleProvider {
  getRole() {
    // here you could provide any role based on any auth flow
    return observableOf('guest');
  }
}

const formSetting = {
  redirectDelay: 500,
  showMessages: {
    success: true,
    error: true,
  },
};

export const NB_CORE_PROVIDERS = [
  ...NbAuthModule.forRoot({
    strategies: [
      NbPasswordAuthStrategy.setup({
        name: 'email',

        token: {
          key: 'accessToken',
          class: NbAuthSimpleToken,
        },

        baseEndpoint: environment.API_URL_PREFIX + '/',

        login: {
          endpoint: 'auth/sign-in',
        },
        register: {
          endpoint: 'auth/sign-up',
          requireValidToken: false,
        },
        logout: {
          endpoint: 'auth/sign-out',
          method: 'post',
        },
        refreshToken: {
          endpoint: 'auth/refresh',
          method: 'get',
        },
      }),
    ],

    forms: {
      login: formSetting,

      logout: {
        redirectDelay: 0,
      },
    },
  }).providers,

  NbSecurityModule.forRoot({
    accessControl: {
      guest: {
        view: '*',
      },
      user: {
        parent: 'guest',
        create: '*',
        edit: '*',
        remove: '*',
      },
    },
  }).providers,

  {
    provide: NbRoleProvider,
    useClass: NbSimpleRoleProvider,
  },
  AnalyticsService,
  LayoutService,
  PlayerService,
  SeoService,
  StateService,
];

@NgModule({
  imports: [CommonModule],
  exports: [NbAuthModule],
  declarations: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: BaseInterceptor,
          multi: true,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        {
          provide: NB_AUTH_TOKEN_INTERCEPTOR_FILTER,
          useValue: (req) => {
            return false;
          },
        },
      ],
    };
  }
}
