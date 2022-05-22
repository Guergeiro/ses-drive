import {
  Collection,
  Entity,
  OneToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { randomBytes } from "crypto";
import { BaseEntity } from "./base.entity";
import { Directory } from "./directory.entity";
import { File } from "./file.entity";
import { Token } from "./token.entity";

@Entity({ tableName: "users" })
export class User extends BaseEntity {
  @Property()
  @Unique()
  email!: string;

  @Property()
  name!: string;

  @Property()
  apiKey = randomBytes(20).toString("hex");

  @Property({ hidden: true })
  password!: string;

  @Property({ hidden: true })
  tokenVersion = 1;

  @OneToMany(() => Directory, (directory) => directory.owner, {
    orphanRemoval: true,
  })
  folders = new Collection<Directory>(this);

  @OneToMany(() => File, (file) => file.owner, { orphanRemoval: true })
  files = new Collection<File>(this);

  @OneToMany(() => Token, (token) => token.user, {
    orphanRemoval: true,
    hidden: true,
  })
  tokens = new Collection<Token>(this);
}
