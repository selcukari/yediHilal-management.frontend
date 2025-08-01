import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';


interface UserParams {
  countryId: number;
  areaId?: number;
  fullName?: string;
  provinceId?: number;
}

interface UserData {
  fullName: string;
  isActive: boolean;
  countryId: number;
  areaId: number;
  provinceId: number;
  identificationNumber?: string;
  telephone?: string;
  email?: string;
  dateOfBirth?: Date;
  createdDate?: string;
  updateDate?: string;
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
      const { countryId, areaId, provinceId, fullName } = params;

      const getUsers = await axios.get(`${this.envService.apiUrl}/management/getUsersBy`,{
        params: {
          countryId ,
          ...(provinceId !== undefined ? {provinceId } : {}),
          ...((fullName == undefined || fullName?.length < 2) ? {} : {fullName}),
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
      const deleteUser = await axios.put(`${this.envService.apiUrl}/management/deleteUser?id=${userId}`);
      if (!deleteUser.data.data) {
        throw new Error('Kullanıcı silinemedi.');
      }
      return deleteUser.data.data;
    } catch (error: any) {
      this.envService.logDebug('deleteUser error', error);
    }
  }

   async updateUser(params: UserData): Promise<any | null> {
    try {
      const updatedUser = await axios.put(`${this.envService.apiUrl}/management/updateUser`, params);
      if (!updatedUser.data.data) {
        throw new Error('Kullanıcı güncellenemedi.');
      }
      return updatedUser.data.data;
    } catch (error: any) {
      this.envService.logDebug('updatedUser error', error);
    }
  }

  async addUser(params: UserData): Promise<any | null> {
    try {
      const addeddUser = await axios.post(`${this.envService.apiUrl}/management/addUser`, params);
      if (!addeddUser.data.data) {
        throw new Error('Kullanıcı eklenemedi.');
      }
      return addeddUser.data.data;
    } catch (error: any) {
      this.envService.logDebug('addeddUser error', error);
    }
  }
}
