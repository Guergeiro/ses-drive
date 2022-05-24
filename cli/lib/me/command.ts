import { Command } from "../../deps.ts";
import { apiurl } from "../url.ts";
import { headers } from "../_utils/headers.ts";
import { json } from "../_utils/request.ts";

export const me = new Command().description("Me related actions").action(
  // @ts-ignore: `key` is always defined as it's a global option
  async function ({ key }: { key: string }) {
    const data = await json(
      await fetch(`${apiurl}/me`, {
        headers: headers(key),
      }),
    );
    console.log(`Hello ${data.name}!`);
  },
).reset();
