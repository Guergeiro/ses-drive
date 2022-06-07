import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File as CustomFile } from '../../types/File';
import { FileUpload } from '../../types/FileUpload';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  API_URL = 'files';

  constructor(private http: HttpClient) {}

  upload(destination: string, files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append(destination, file);
    }

    return this.http.post<FileUpload[]>(this.API_URL, formData);
  }

  download(id: string) {
    return this.http.get(`${this.API_URL}/${id}/ops/download`, {
      responseType: 'blob',
    });
  }

  rename(id: string, name: string) {
    return this.http.patch<CustomFile>(`${this.API_URL}/${id}/ops/rename`, {
      name,
    });
  }

  delete(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  getSharedFiles() {
    let params: HttpParams = new HttpParams();
    params = params.append('shared', true);

    return this.http.get<CustomFile[]>(this.API_URL, { params });
  }

  share(id: string, type: string, userEmail: string) {
    return this.http.patch<CustomFile>(`${this.API_URL}/${id}/ops/share`, {
      type,
      userEmail,
    });
  }
}
