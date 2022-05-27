import { yellow } from "../../deps.ts";

export type FileSystem = {
  id: string;
  name: string;
  fullpath: string;
};

export function printFileSystem(data: FileSystem) {
  return `${yellow(data.id)} - ${data.fullpath}`;
}
