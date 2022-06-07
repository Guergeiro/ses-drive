import { yellow } from "../../deps.ts";

export type FileSystem = {
  id: string;
  fullpath: string;
  name: string;
};

export type Directory = FileSystem & {
  parent: Directory;
  folders: Array<Directory>;
  files: Array<FileSystem>;
};

export function printFileSystem(data: FileSystem) {
  return `${yellow(data.id)} - ${data.fullpath}`;
}
