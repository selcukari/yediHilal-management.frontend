import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
interface MemberParams {
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
export class MemberService {
  private envService = inject(EnvironmentService);

  constructor(private http: HttpClient) {}


  async users(params: MemberParams): Promise<any| null> {
    try {
      const { countryId, areaId, provinceId, fullName } = params;

      const getUsers: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/management/getUsersBy`,{
        params: {
          countryId ,
          ...(provinceId !== undefined ? {provinceId } : {}),
          ...((fullName == undefined || fullName?.length < 2) ? {} : {fullName}),
          ...((areaId == undefined || countryId != 1) ? { } : {areaId})
        }}));
      if (getUsers?.errors) {
        throw new Error('getUsers bulunamadı.');
      }
      return getUsers.data;
    } catch (error: any) {
      this.envService.logDebug('getUsers error', error);
    }
  }

  async deleteUser(userId: number): Promise<any | null> {
    try {
      const deleteUser: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/management/deleteUser?id=${userId}`, null));
      if (deleteUser?.errors) {
        throw new Error('Kullanıcı silinemedi.');
      }
      return deleteUser.data;
    } catch (error: any) {
      this.envService.logDebug('deleteUser error', error);
    }
  }

   async updateUser(params: UserData): Promise<any | null> {
    try {
      const updatedUser: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/management/updateUser`, params));
      if (updatedUser?.errors) {
        throw new Error('Kullanıcı güncellenemedi.');
      }
      return updatedUser.data;
    } catch (error: any) {
      this.envService.logDebug('updatedUser error', error);
    }
  }

  async addUser(params: UserData): Promise<any | null> {
    try {
      const addeddUser: any = await firstValueFrom(this.http.post(`${this.envService.apiUrl}/management/addUser`, params));
      if (addeddUser?.errors) {
        throw new Error('Kullanıcı eklenemedi.');
      }
      return addeddUser.data;
    } catch (error: any) {
      this.envService.logDebug('addeddUser error', error);
    }
  }
}
