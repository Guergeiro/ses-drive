import { Command } from "../../deps.ts";
import { apiurl } from "../url.ts";
import { headers } from "../_utils/headers.ts";

export const download = new Command().description("Download a file")
  .arguments("<id:string> [destination:string]")
  .action(
    // @ts-ignore: `key` is always defined as it's a global option
    async function (
      { key }: { key: string },
      id: string,
      destination?: string,
    ) {
      const res = await fetch(`${apiurl}/files/${id}/ops-download`, {
        headers: headers(key, false),
      });

      if (res.status >= 400) {
        const json = await res.json();
        throw new Error(json.message);
      }

      const content = res.headers.get("content-disposition");
      if (content == null) {
        return;
      }
      const [_, filename] = content.replaceAll('"', "").split("=");

      const buffer = await res.arrayBuffer();

      if (destination == null) {
        await write(filename, buffer)
      } else {
        await write(`${destination}/${filename}`, buffer);
      }

      console.log(`Downloaded file: ${filename}`);
    },
  );

async function write(fullpath: string, buffer: ArrayBuffer) {
  await Deno.writeFile(fullpath, new Uint8Array(buffer));
}
