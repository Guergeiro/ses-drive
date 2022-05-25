export type FileSystem = {
  id: string;
  name: string;
  fullpath: string;
}

export function printFileSystem(data: FileSystem) {
  return `${data.id} - ${data.fullpath}`;
}
