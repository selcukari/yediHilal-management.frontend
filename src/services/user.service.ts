import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';


interface UserParams {
  countryId: number;
  areaId?: number;
  districtId?: number;
  fullName?: string;
  provinceId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private envService = inject(EnvironmentService);

constructor() {
  }

  async users(params: UserParams): Promise<any| null> {
    try {
      const { countryId, areaId, provinceId, fullName, districtId } = params;

      const getUsers = await axios.get(`${this.envService.apiUrl}/getUsersBy`,{
        params: {
          countryId ,
          ...(provinceId !== undefined ? {provinceId } : {}),
          ...((fullName == undefined || fullName?.length < 2) ? {} : {fullName}),
          ...((districtId == undefined || countryId != 1) ? {} : {districtId}),
          ...((areaId == undefined || countryId != 1) ? { } : {areaId})
        }});
      if (!getUsers.data.data) {
        throw new Error('getUsers bulunamadı.');
      }
      return getUsers.data.data;
    } catch (error: any) {
      this.envService.logDebug('getUsers error', error);
    }
  }

  async deleteUser(userId: number): Promise<any | null> {
    try {
      const deleteUser = await axios.put(`${this.envService.apiUrl}/deleteUser?id=${userId}`);
      if (!deleteUser.data.data) {
        throw new Error('Kullanıcı silinemedi.');
      }
      return deleteUser.data.data;
    } catch (error: any) {
      this.envService.logDebug('deleteUser error', error);
    }
  }
}
