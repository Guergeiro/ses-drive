import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  NbAuthSocialLink,
  NbAuthService,
  NB_AUTH_OPTIONS,
  getDeepFromObject,
  NbAuthResult,
} from '@nebular/auth';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  redirectDelay: number = 0;
  showMessages: any = {};
  strategy: string = '';

  errors: string[] = [];
  messages: string[] = [];
  user: any = {};
  submitted: boolean = false;
  socialLinks: NbAuthSocialLink[] = [];
  rememberMe = false;

  siteKey: string;
  recaptchaToken: string;
  recaptchaAction = 'signin';

  constructor(
    protected service: NbAuthService,
    @Inject(NB_AUTH_OPTIONS) protected options = {},
    protected cdr: ChangeDetectorRef,
    protected router: Router,
    private readonly reCaptchaV3Service: ReCaptchaV3Service,
  ) {
    this.redirectDelay = this.getConfigValue('forms.login.redirectDelay');
    this.showMessages = this.getConfigValue('forms.login.showMessages');
    this.strategy = this.getConfigValue('forms.login.strategy');
    this.socialLinks = this.getConfigValue('forms.login.socialLinks');
    this.rememberMe = this.getConfigValue('forms.login.rememberMe');
  }

  ngOnInit() {
    this.siteKey = environment.RECAPTHA_KEY;
  }

  login(): void {
    this.errors = [];
    this.messages = [];
    this.submitted = true;

    this.reCaptchaV3Service.execute(
      this.siteKey,
      this.recaptchaAction,
      (token) => {
        this.recaptchaToken = token;

        const obj = {
          ...this.user,
          recaptchaToken: this.recaptchaToken,
          recaptchaAction: this.recaptchaAction,
        };

        this.service
          .authenticate(this.strategy, obj)
          .subscribe((result: NbAuthResult) => {
            this.submitted = false;

            if (result.isSuccess()) {
              this.messages = result.getMessages();
            } else {
              this.errors = result.getErrors();
            }

            const redirect = result.getRedirect();
            if (redirect) {
              setTimeout(() => {
                return this.router.navigateByUrl(redirect);
              }, this.redirectDelay);
            }
            this.cdr.detectChanges();
          });
      },
    );
  }

  getConfigValue(key: string): any {
    return getDeepFromObject(this.options, key, null);
  }
}
