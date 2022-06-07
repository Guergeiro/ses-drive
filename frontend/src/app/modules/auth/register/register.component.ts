import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  NbAuthService,
  NB_AUTH_OPTIONS,
  getDeepFromObject,
  NbAuthResult,
} from '@nebular/auth';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  redirectDelay: number = 0;
  showMessages: any = {};
  strategy: string = '';

  submitted = false;
  errors: string[] = [];
  messages: string[] = [];
  user: any = {};

  siteKey: string;
  recaptchaToken: string;
  recaptchaAction = 'signout';

  constructor(
    private readonly service: NbAuthService,
    @Inject(NB_AUTH_OPTIONS) private readonly options = {},
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly reCaptchaV3Service: ReCaptchaV3Service,
  ) {
    this.redirectDelay = this.getConfigValue('forms.register.redirectDelay');
    this.showMessages = this.getConfigValue('forms.register.showMessages');
    this.strategy = this.getConfigValue('forms.register.strategy');
  }

  ngOnInit(): void {
    this.siteKey = environment.RECAPTHA_KEY;
  }

  register(): void {
    this.errors = this.messages = [];
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
          .register(this.strategy, obj)
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
