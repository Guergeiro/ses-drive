import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  API_URL = 'files';

  constructor(private http: HttpClient) {}

  upload(destination: string, file: File) {
    const formData = new FormData();
    formData.append(destination, file);

    return this.http.post<any>(this.API_URL, formData);
  }
}
