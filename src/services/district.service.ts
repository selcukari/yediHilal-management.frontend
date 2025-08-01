import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';


interface DistrictParams {
  provinceId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DistrictService {
  private envService = inject(EnvironmentService);

constructor() {
  }

  async districts(params: DistrictParams): Promise<any| null> {
    try {
      const { provinceId } = params;

      const getDistricts = await axios.get(`${this.envService.apiUrl}/management/getDistrictsByProvince`,{
        params: {
          provinceId
        }});
      if (!getDistricts.data.data) {
        throw new Error('getDistricts bulunamadı.');
      }
      return getDistricts.data.data;
    } catch (error: any) {
      this.envService.logDebug('getDistricts error', error);
    }
  }
}
