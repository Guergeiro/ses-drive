import { Command } from "../../deps.ts";
import { create } from "./create.ts";
import { del } from "./delete.ts";
import { list } from "./list.ts";
import { rename } from "./rename.ts";

export const directory = new Command().description("Directory related actions")
  .command("list", list).reset()
  .command("create", create).reset()
  .command("delete", del).reset()
  .command("rename", rename).reset()
