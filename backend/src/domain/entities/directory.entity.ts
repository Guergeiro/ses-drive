import {
  Collection,
  Entity,
  Filter,
  ManyToMany,
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
@Filter({
  name: "READ",
  cond: ({ user }) => ({
    $or: [
      {
        owner: user,
      },
      {
        viewers: {
          $elemMatch: {
            $eq: user,
          },
        },
      },
      {
        editors: {
          $elemMatch: {
            $eq: user,
          },
        },
      },
    ],
  }),
})
@Filter({
  name: "UPDATE",
  cond: ({ user }) => ({
    $or: [
      {
        owner: user,
      },
      {
        editors: {
          $elemMatch: {
            $eq: user,
          },
        },
      },
    ],
  }),
})
@Filter({
  name: "CREATE",
  cond: ({ user }) => ({ owner: user }),
})
@Filter({
  name: "DELETE",
  cond: ({ user }) => ({ owner: user }),
})
export class Directory extends BaseEntity {
  @Property({ persist: false })
  get name() {
    const splited = this.fullpath.split("/");
    return splited.pop();
  }

  set name(newName: string) {
    const splitted = this.fullpath.split("/");
    splitted.pop();
    this.fullpath = `${splitted.join("/")}/${newName}`;
  }

  @Property({ persist: false, hidden: true })
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

  @ManyToMany()
  viewers = new Collection<User>(this);

  @ManyToMany()
  editors = new Collection<User>(this);
}
