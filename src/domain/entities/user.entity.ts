import {
  Collection,
  Entity,
  EventArgs,
  OneToMany,
  Property,
  BeforeCreate,
  BeforeUpdate,
} from "@mikro-orm/core";
import { genSalt, hash } from "bcrypt";
import { BaseEntity } from "./base.entity";
import { File } from "./file.entity";

@Entity()
export class User extends BaseEntity {
  @Property()
  email!: string;

  @Property()
  password!: string;

  @Property()
  tokenVersion = 1;

  @OneToMany(() => File, (file) => file.owner)
  files = new Collection<File>(this);
}
