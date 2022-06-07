export type Folder = {
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
