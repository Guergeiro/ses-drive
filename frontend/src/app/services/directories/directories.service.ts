import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Directory } from '../../types/Directory';

@Injectable({
  providedIn: 'root',
})
export class DirectoriesService {
  API_URL = 'directories';

  constructor(private http: HttpClient) {}

  getByPath(path?: string) {
    let params: HttpParams = new HttpParams();

    if (path != null) {
      params = params.append('path', path);
    }

    if (path === '/') {
      params = params.delete('path');
      params = params.append('shared', true);
    }

    return this.http.get<Directory>(this.API_URL, { params });
  }

  create(name: string, path?: string) {
    return this.http.post<Directory>(this.API_URL, { name, path });
  }

  delete(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  rename(id: string, name: string) {
    return this.http.patch<Directory>(`${this.API_URL}/${id}/ops/rename`, {
      name,
    });
  }

  share(id: string, type: string, userEmail: string) {
    return this.http.patch<Directory>(`${this.API_URL}/${id}/ops/share`, {
      type,
      userEmail,
    });
  }
}
