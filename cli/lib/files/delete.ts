import { Command } from "../../deps.ts";
import { apiurl } from "../url.ts";
import { headers } from "../_utils/headers.ts";
import { json } from "../_utils/request.ts";

export const del = new Command().description("Deletes a file").arguments(
  "<id:string>",
).action(
  // @ts-ignore: `key` is always defined as it's a global option
async function ({key}: {key: string}, id: string) {
  const data = await json(await fetch(`${apiurl}/files/${id}`, {
    headers: headers(key),
    method: "DELETE",
  }))

  console.log(data.message);
});
