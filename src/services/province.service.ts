import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  async provinces(params: ProvinceParams): Promise<any| null> {
    try {
      const { countryId, areaId } = params;

      const getProvinces: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/management/getProvincesByCountryOrArea`, {
        params: {
          countryId,
        ...(areaId == undefined || areaId == 8 ? {} : {areaId})
        }}));
      if (getProvinces?.errors) {
        throw new Error('getProvinces bulunamadı.');
      }
      return getProvinces.data;
    } catch (error: any) {
      this.envService.logDebug('getProvinces error', error);
    }
  }
}
