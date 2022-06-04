import {
  BeforeCreate,
  BeforeUpdate,
  Collection,
  Entity,
  EventArgs,
  ManyToMany,
  OneToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { genSalt, hash } from "bcrypt";
import { randomBytes } from "crypto";
import { environment } from "src/configs/environment";
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
  tokenVersion = 0;

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

  @ManyToMany(() => File, (file) => file.viewers)
  sharedViewFiles = new Collection<File>(this);

  @ManyToMany(() => File, (file) => file.editors)
  sharedEditFiles = new Collection<File>(this);

  @ManyToMany(() => Directory, (directory) => directory.viewers)
  sharedViewFolders = new Collection<Directory>(this);

  @ManyToMany(() => Directory, (directory) => directory.editors)
  sharedEditFolders = new Collection<Directory>(this);

  @BeforeCreate()
  @BeforeUpdate()
  public async hashPassword({ changeSet }: EventArgs<this>) {
    if (changeSet.payload.password == null) {
      return;
    }
    const { auth } = await environment();
    const salt = await genSalt(10);
    const password = `${changeSet.payload.password}:${auth.PEPPER}`;
    this.password = await hash(password, salt);
    this.tokenVersion += 1;
  }
}
