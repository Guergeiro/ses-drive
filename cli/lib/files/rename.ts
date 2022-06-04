import { Command } from "../../deps.ts";
import { apiurl } from "../url.ts";
import { headers } from "../_utils/headers.ts";
import { json } from "../_utils/request.ts";

export const rename = new Command().description("Rename a file").arguments(
  "<id:string> <name:string>",
).action(
  // @ts-ignore: `key` is always defined as it's a global option
  async function ({ key }: { key: string }, id: string, name: string) {
    const body: Record<string, string> = {
      name: name,
    };

    const data = await json(
      await fetch(`${apiurl}/files/${id}/ops/rename`, {
        headers: headers(key),
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    );
    console.log(data.message);
  },
);
