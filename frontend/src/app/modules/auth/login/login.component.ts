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
import { MeService } from '../../../services/me/me.service';
import { User } from '../../../types/User';

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
  rememberMe = false;

  siteKey: string;
  recaptchaToken: string;
  recaptchaAction = 'signin';

  constructor(
    private readonly service: NbAuthService,
    @Inject(NB_AUTH_OPTIONS) private readonly options = {},
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly reCaptchaV3Service: ReCaptchaV3Service,
    private readonly meService: MeService,
  ) {
    this.redirectDelay = this.getConfigValue('forms.login.redirectDelay');
    this.showMessages = this.getConfigValue('forms.login.showMessages');
    this.strategy = this.getConfigValue('forms.login.strategy');
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

            this.meService
              .me()
              .pipe()
              .subscribe((user: User) => {
                sessionStorage.setItem('user_email', user.email);
                sessionStorage.setItem('user_id', user.id);

                const redirect = result.getRedirect();
                if (redirect) {
                  setTimeout(() => {
                    return this.router.navigateByUrl(redirect);
                  }, this.redirectDelay);
                }
                this.cdr.detectChanges();
              });
          });
      },
    );
  }

  getConfigValue(key: string): any {
    return getDeepFromObject(this.options, key, null);
  }
}
