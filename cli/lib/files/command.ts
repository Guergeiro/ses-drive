import { Command } from "../../deps.ts";
import { download } from "./download.ts";
import { list } from "./list.ts";
import { upload } from "./upload.ts";

export const files = new Command().description("Files related actions")
  .command("upload", upload).reset()
  .command("list", list).reset()
  .command("download", download).reset()
