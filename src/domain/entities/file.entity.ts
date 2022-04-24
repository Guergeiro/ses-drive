import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

@Entity({ tableName: "files" })
export class File extends BaseEntity {
  @Property()
  name!: string;

  @ManyToOne()
  owner: User;
}
