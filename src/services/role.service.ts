import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private envService = inject(EnvironmentService);

  constructor(private http: HttpClient) {}

  async roles(): Promise<any| null> {
    try {
      const getRoles: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/managementUser/getRoles`));
      if (getRoles?.errors) {
        throw new Error('getRoles bulunamadı.');
      }
      return getRoles.data;
    } catch (error: any) {
      this.envService.logDebug('getRoles error', error);
    }
  }
}
