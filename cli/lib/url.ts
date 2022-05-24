import { majorVersion } from "./version.ts";

const baseUrl = Deno.env.get("URL") || "http://0.0.0.0:3000";

export const apiurl = `${baseUrl}/api/v${majorVersion}`;
