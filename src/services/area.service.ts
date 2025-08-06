import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private envService = inject(EnvironmentService);

  constructor(private http: HttpClient) {}

  async areas(): Promise<any| null> {
    try {
      const getAreas: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/management/getAreas`));
      if (getAreas?.errors) {
        throw new Error('getAreas bulunamadı.');
      }

      return getAreas.data;
    } catch (error: any) {
      this.envService.logDebug('getAreas error', error);
    }
  }
}
