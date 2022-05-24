export type FileSystem = {
  id: string;
  fullpath: string;
  parent: FileSystem;
  folders: Array<FileSystem>;
  files: Array<FileSystem>;
};

export function printFileSystem(data: FileSystem) {
  return `${data.id} - ${data.fullpath}`;
}
