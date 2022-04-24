import {
  Collection,
  Entity,
  OneToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";
import { File } from "./file.entity";
import { Token } from "./token.entity";

@Entity({ tableName: "users" })
export class User extends BaseEntity {
  @Property()
  @Unique()
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @Property({ hidden: true })
  tokenVersion = 1;

  @OneToMany(() => File, (file) => file.owner, { orphanRemoval: true })
  files = new Collection<File>(this);

  @OneToMany(() => Token, (token) => token.user, {
    orphanRemoval: true,
    hidden: true,
  })
  tokens = new Collection<Token>(this);
}
