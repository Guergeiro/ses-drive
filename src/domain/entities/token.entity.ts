import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

@Entity()
export class Token extends BaseEntity {
  @Property()
  type!: "refresh";

  @Property()
  token!: string;

  @Property()
  expiresAt!: Date;

  @ManyToOne()
  user!: User;
}
