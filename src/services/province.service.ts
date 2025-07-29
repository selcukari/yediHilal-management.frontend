import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';


interface ProvinceParams {
  countryId: number;
  areaId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProvinceService {
  private envService = inject(EnvironmentService);

constructor() {
  }

  async provinces(params: ProvinceParams): Promise<any| null> {
    try {
      const { countryId, areaId } = params;

      const getProvinces = await axios.get(`${this.envService.apiUrl}/getProvincesByCountryOrArea`,{
        params: {
          countryId,
          ...((areaId == undefined || countryId != 1) ? { } : {areaId})
        }});
      if (!getProvinces.data.data) {
        throw new Error('getProvinces bulunamadı.');
      }
      return getProvinces.data.data;
    } catch (error: any) {
      this.envService.logDebug('getProvinces error', error);
    }
  }
}
