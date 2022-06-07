import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Created by
      <b><a href="https://brenosalles.com" target="_blank">Breno Salles</a></b>
      & <b><a href="https://diogomcosta.com" target="_blank">Diogo Costa</a></b>
    </span>
    <div class="socials">
      <a
        href="#https://github.com/Guergeiro/ses-drive/releases"
        target="_blank"
        class="ion ion-social-github"
      ></a>
    </div>
  `,
})
export class FooterComponent {}
