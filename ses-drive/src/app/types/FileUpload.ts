export type FileUpload = {
  fileObj: {
    id: string;
    createdAt: string;
    updatedAt: string;
    fullpath: string;
    owner: {
      id: string;
      createdAt: string;
      updatedAt: string;
      apiKey: string;
      email: string;
      name: string;
    };
    folder: {
      id: string;
      createdAt: string;
      updatedAt: string;
      fullpath: string;
      owner: {
        id: string;
        createdAt: string;
        updatedAt: string;
        apiKey: string;
        email: string;
        name: string;
      };
      parent: string;
      name: string;
    };
    mimetype: string;
    name: string;
  };
  fulfilled: boolean;
};
