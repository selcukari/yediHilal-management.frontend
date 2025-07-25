import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private envService = inject(EnvironmentService);

constructor() {
  }

  async countries(): Promise<any| null> {
    try {
      const getCountries = await axios.get(`${this.envService.apiUrl}/getCountries`);
      if (!getCountries.data.data) {
        throw new Error('getCountries bulunamadı.');
      }
      return getCountries.data.data;
    } catch (error: any) {
      this.envService.logDebug('getCountries error', error);
    }
  }
}
