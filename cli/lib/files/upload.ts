import { Command } from "../../deps.ts";
import { apiurl } from "../url.ts";
import { headers } from "../_utils/headers.ts";
import { json } from "../_utils/request.ts";
import { printFileSystem } from "./_utils.ts";

type FileSystem = {
  id: string;
  name: string;
  fullpath: string;
};

type Output = {
  fileObj: FileSystem;
  fulfilled: boolean;
};

export const upload = new Command().description("Upload a file")
  .arguments("<source:string> <destination:string>").action(
    // @ts-ignore: `key` is always defined as it's a global option
    async function (
      { key }: { key: string },
      source: string,
      destination: string,
    ) {
      const file = new File(
        [await Deno.readFile(source)],
        source.split("/").pop()!,
      );

      const formData = new FormData();
      formData.append(
        destination,
        file,
      );

      const data: Array<Output> = await json(
        await fetch(`${apiurl}/files`, {
          headers: headers(key, false),
          method: "POST",
          body: formData,
        }),
      );
      console.log(gatherResults(data));
    },
  );

function gatherResults(data: Array<Output>) {
  const output: string[] = [];

  for (const { fulfilled, fileObj } of data) {
    if (fulfilled === false) {
      output.push(`Not Uploaded - ${fileObj.fullpath}`);
    } else {
      output.push(printFileSystem(fileObj));
    }
  }

  return output.join("\n");
}
