import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../types/User';

@Injectable({
  providedIn: 'root',
})
export class MeService {
  URL = 'me';
  constructor(private http: HttpClient) {}

  me() {
    return this.http.get<User>(this.URL);
  }

  refreshApiKey() {
    return this.http.patch(`${this.URL}/ops/generate-api-key`, {});
  }
}
