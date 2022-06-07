import { Command } from "./deps.ts";
import { description } from "./lib/description.ts";
import { directory } from "./lib/directories/command.ts";
import { files } from "./lib/files/command.ts";
import { me } from "./lib/me/command.ts";
import { name } from "./lib/name.ts";
import { version } from "./lib/version.ts";

async function main() {
  try {
    await new Command().name(name).version(version).description(
      description,
    )
      .globalOption("-K, --key [key:string]", "User's API Key", {
        required: true,
      })
      .command("me", me)
      .command("directory", directory)
      .command("files", files)
      .parse(
        Deno.args,
      );
  } catch (err) {
    console.error(err.message);
  }
}

if (import.meta.main === true) {
  await main();
}
