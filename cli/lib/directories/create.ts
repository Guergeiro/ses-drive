import { Command } from "../../deps.ts";
import { apiurl } from "../url.ts";
import { headers } from "../_utils/headers.ts";
import { json } from "../_utils/request.ts";
import { FileSystem, printFileSystem } from "./_utils.ts";

export const create = new Command().description("Create a directory").arguments(
  "<name:string> [path:string]",
).action(
  // @ts-ignore: `key` is always defined as it's a global option
  async function ({ key }: { key: string }, name: string, path?: string) {
    const body: Record<string, string> = {
      name: name,
    };

    if (path != null) {
      body.path = path;
    }

    const data: FileSystem = await json(
      await fetch(`${apiurl}/directories`, {
        headers: headers(key),
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    console.log(printFileSystem(data));
  },
);
