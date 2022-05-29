import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { File } from '../../types/File';

@Component({
  selector: 'ngx-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnInit {
  @Input() file: File;

  loading = false;
  subscriptions: Subscription[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
