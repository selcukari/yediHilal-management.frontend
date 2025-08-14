import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { EnvironmentService } from './environment.service';

interface MemberParams {
  countryId: number;
  areaId?: number;
  fullName?: string;
  provinceId?: number;
  roleId?: number;
}

interface UserData {
  fullName: string;
  password: string;
  isActive: boolean;
  countryId: number;
  areaId: number;
  provinceId: number;
  roleId: number;
  identificationNumber?: string;
  telephone: string;
  email?: string;
  countryCode: string;
  dateOfBirth?: Date;
  createdDate?: string;
  updateDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private envService = inject(EnvironmentService);

  constructor(private http: HttpClient) {}

  async users(params: MemberParams): Promise<any| null> {
    try {
      const { countryId, areaId, provinceId, fullName, roleId } = params;

      const getUsers: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/managementUser/getUsersBy`,{
        params: {
          countryId ,
          ...(provinceId !== undefined ? {provinceId } : {}),
          ...((fullName == undefined || fullName?.length < 2) ? {} : {fullName}),
          ...((areaId == undefined || countryId != 1) ? { } : {areaId}),
          ...(roleId !== undefined ? {roleId } : {}),
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
      const deleteUser: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/managementUser/deleteUser?id=${userId}`, null));
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
      const updatedUser: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/managementUser/updateUser`, params));

      return updatedUser.data;
    } catch (error: any) {
      this.envService.logDebug('updatedUser error', error);

      return error.error;
    }
  }

  async addUser(params: UserData): Promise<any | null> {
    try {
      const addedUser: any = await firstValueFrom(this.http.post(`${this.envService.apiUrl}/managementUser/addUser`, params));

      return addedUser.data;
    } catch (error: any) {
      this.envService.logDebug('addedUser error', error);

      return error.error;
    }
  }
}
