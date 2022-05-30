import {
  Collection,
  Entity,
  Filter,
  ManyToMany,
  ManyToOne,
  Property,
  Unique,
} from "@mikro-orm/core";
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
@Filter({
  name: "CASL_READ",
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
    ],
  }),
})
@Filter({
  name: "CASL_WRITE",
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
export class File extends BaseEntity {
  @Property({ persist: false })
  get name() {
    const splited = this.fullpath.split("/");
    return splited.pop();
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

  @Property()
  mimetype!: string;

  @ManyToOne()
  owner!: User;

  @ManyToOne()
  folder!: Directory;

  @ManyToMany()
  viewers = new Collection<User>(this);

  @ManyToMany()
  editors = new Collection<User>(this);
}
