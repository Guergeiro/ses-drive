import { Command } from "../../deps.ts";
import { apiurl } from "../url.ts";
import { headers } from "../_utils/headers.ts";
import { json } from "../_utils/request.ts";
import { Directory, printFileSystem } from "./_utils.ts";

export const list = new Command().description(
  "Lists everything in the directory",
).arguments("[basepath:string]").action(
  // @ts-ignore: `key` is always defined as it's a global option
  async function ({ key }: { key: string }, basepath?: string) {
    const url = new URL(`${apiurl}/directories`);

    if (basepath != null) {
      url.searchParams.append("path", basepath);
    }

    const data: Directory = await json(
      await fetch(url.toString(), {
        headers: headers(key),
      }),
    );
    console.log(gatherResults(data));
  },
);

function gatherResults(data: Directory) {
  const output: string[] = [];

  output.push(printFileSystem(data));
  for (const folder of data.folders) {
    output.push(printFileSystem(folder));
  }
  for (const file of data.files) {
    output.push(printFileSystem(file));
  }
  return output.join("\n");
}
