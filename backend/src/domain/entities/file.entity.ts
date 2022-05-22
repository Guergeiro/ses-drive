import { Entity, Filter, ManyToOne, Property, Unique } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";
import { Directory } from "./directory.entity";
import { User } from "./user.entity";

@Entity({ tableName: "files" })
@Filter({
  name: "path",
  cond: (args) => ({ fullpath: { $re: new RegExp(`^${args.path}`, "i") } }),
})
@Filter({
  name: "name",
  cond: (args) => ({ fullpath: { $re: new RegExp(`${args.name}$`, "i") } }),
})
export class File extends BaseEntity {
  @Property({ persist: false })
  get name() {
    const splited = this.fullpath.split("/");
    return splited.pop();
  }

  @Property()
  @Unique()
  fullpath!: string;

  @ManyToOne()
  owner!: User;

  @ManyToOne()
  folder!: Directory;

  @Property()
  mimetype!: string;
}
