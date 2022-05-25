import {
  Collection,
  Entity,
  Filter,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";
import { File } from "./file.entity";
import { User } from "./user.entity";

@Entity({ tableName: "directories" })
@Filter({
  name: "path",
  cond: (args) => ({ fullpath: { $re: new RegExp(`^${args.path}`, "i") } }),
})
@Filter({
  name: "name",
  cond: (args) => ({ fullpath: { $re: new RegExp(`${args.name}$`, "i") } }),
})
export class Directory extends BaseEntity {
  @Property({ persist: false })
  get name() {
    const splited = this.fullpath.split("/");
    return splited.pop();
  }

  @Property({ persist: false })
  get scope() {
    const splited = this.fullpath.split("/");
    splited.shift();
    return splited.shift(); // Either public or private
  }

  @Property()
  @Unique()
  fullpath!: string;

  @ManyToOne()
  owner!: User;

  @ManyToOne()
  parent!: Directory;

  @OneToMany(() => Directory, (directory) => directory.parent, {
    orphanRemoval: true,
  })
  folders = new Collection<Directory>(this);

  @OneToMany(() => File, (file) => file.folder, {
    orphanRemoval: true,
  })
  files = new Collection<File>(this);
}
