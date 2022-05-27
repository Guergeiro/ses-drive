import { Command } from "../../deps.ts";
import { apiurl } from "../url.ts";
import { headers } from "../_utils/headers.ts";
import { json } from "../_utils/request.ts";
import { FileSystem, printFileSystem } from "./_utils.ts";

export const list = new Command().description("Lists files")
  .option("-p, --path [path:string]", "Path to filter")
  .option("-n, --name [name:string]", "Name to filter")
  .action(
    // @ts-ignore: `key` is always defined as it's a global option
    async function (
      { key, path, name }: { key: string; path?: string; name?: string },
    ) {
      const url = new URL(`${apiurl}/files`);

      if (path != null) {
        url.searchParams.append("path", path);
      }
      if (name != null) {
        url.searchParams.append("name", name);
      }

      const data: Array<FileSystem> = await json(
        await fetch(url.toString(), { headers: headers(key) }),
      );
      console.log(gatherResults(data));
    },
  );

function gatherResults(data: Array<FileSystem>) {
  const output: string[] = [];

  for (const file of data) {
    output.push(printFileSystem(file));
  }

  return output.join("\n");
}
