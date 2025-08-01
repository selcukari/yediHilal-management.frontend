import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private envService = inject(EnvironmentService);

constructor() {
  }

  async roles(): Promise<any| null> {
    try {
      const getRoles = await axios.get(`${this.envService.apiUrl}/managementMember/getRoles`);
      if (!getRoles.data.data) {
        throw new Error('getRoles bulunamadı.');
      }
      return getRoles.data.data;
    } catch (error: any) {
      this.envService.logDebug('getRoles error', error);
    }
  }
}
