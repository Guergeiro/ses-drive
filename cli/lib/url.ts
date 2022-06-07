import { majorVersion } from "./version.ts";

const baseUrl = "https://ses-drive-backend.herokuapp.com";

export const apiurl = `${baseUrl}/api/v${majorVersion}`;
