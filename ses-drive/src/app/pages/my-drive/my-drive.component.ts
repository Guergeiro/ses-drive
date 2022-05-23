import { Component, OnInit } from "@angular/core";
import { NbMenuService } from "@nebular/theme";
import { filter, map } from "rxjs/operators";

@Component({
  selector: "ngx-my-drive",
  templateUrl: "./my-drive.component.html",
  styleUrls: ["./my-drive.component.scss"],
})
export class MyDriveComponent implements OnInit {
  items = [
    { title: "File", icon: "file-add" },
    { title: "Folder", icon: "folder-add" },
  ];

  constructor(private readonly nbMenuService: NbMenuService) {}

  ngOnInit(): void {
    this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === "my-context-menu"),
        map(({ item: { title } }) => title)
      )
      .subscribe((title) => alert(`${title} was clicked!`));
  }
}
