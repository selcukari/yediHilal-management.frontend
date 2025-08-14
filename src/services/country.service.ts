import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private envService = inject(EnvironmentService);

  constructor(private http: HttpClient) {}

  async countries(): Promise<any| null> {
    try {
      const getCountries: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/management/getCountries`));

      return getCountries.data;
    } catch (error: any) {
      this.envService.logDebug('getCountries error', error);

      return error.error;
    }
  }
}
