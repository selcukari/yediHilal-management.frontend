import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private envService = inject(EnvironmentService);

constructor() {
  }

  async areas(): Promise<any| null> {
    try {
      const getAreas = await axios.get(`${this.envService.apiUrl}/getAreas`);
      if (!getAreas.data.data) {
        throw new Error('getAreas bulunamadı.');
      }
      return getAreas.data.data;
    } catch (error: any) {
      this.envService.logDebug('getAreas error', error);
    }
  }
}
