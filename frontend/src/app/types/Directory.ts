export type Directory = {
  files: File[];
  folders: Omit<Directory, 'files' | 'folders'>[];
  fullpath: string;
  id: string;
  name: string;
  owner: string;
  parent: string;
  updatedAt: Date;
  createdAt: Date;
  viewers: string[];
  editors: string[];
};
