import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Folder } from '../../types/Folder';

@Component({
  selector: 'ngx-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss'],
})
export class FolderComponent {
  @Input() folder: Folder;

  @Output() newChangeDirectory = new EventEmitter<string>();

  changeDirectory(path: string) {
    this.newChangeDirectory.emit(path);
  }
}
