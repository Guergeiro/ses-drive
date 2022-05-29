import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileUpload } from '../../types/FileUpload';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  API_URL = 'files';

  constructor(private http: HttpClient) {}

  upload(destination: string, file: File) {
    const formData = new FormData();
    formData.append(destination, file);

    return this.http.post<FileUpload>(this.API_URL, formData);
  }

  download(id: string) {
    return this.http.get<Blob>(`${this.API_URL}/${id}/ops/download`, {
      responseType: 'blob' as 'json',
    });
  }
}
