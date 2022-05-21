import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { BehaviorSubject, filter, map } from "rxjs";

@Injectable()
export class GetFilesStatusService {
  private readonly $subject = new BehaviorSubject<{
    fileObj: File;
    fulfilled: boolean;
  }>(null);

  @OnEvent("files.created")
  public evenHandler(payload: Array<{ fileObj: File; fulfilled: boolean }>) {
    for (const obj of payload) {
      this.$subject.next(obj);
    }
  }

  public execute(user: User) {
    return this.$subject.asObservable().pipe(
      filter(function (value) {
        return value != null;
      }),
      filter(function ({ fileObj }) {
        return fileObj.owner.id === user.id;
      }),
      map(function (value) {
        return { data: value };
      }),
    );
  }
}
