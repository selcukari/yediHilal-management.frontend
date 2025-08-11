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

  async members(params: MemberParams): Promise<any| null> {
    try {
      const { countryId, areaId, provinceId, fullName, roleId } = params;

      const getMembers: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/managementMember/getMembersBy`,{
        params: {
          countryId ,
          ...(provinceId !== undefined ? {provinceId } : {}),
          ...((fullName == undefined || fullName?.length < 2) ? {} : {fullName}),
          ...((areaId == undefined || countryId != 1) ? { } : {areaId}),
          ...(roleId !== undefined ? {roleId } : {}),
        }}));
      if (getMembers?.errors) {
        throw new Error('getMembers bulunamadı.');
      }
      return getMembers.data;
    } catch (error: any) {
      this.envService.logDebug('getMembers error', error);
    }
  }

  async deleteMember(userId: number): Promise<any | null> {
    try {
      const deleteUser: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/managementMember/deleteMember?id=${userId}`, null));
      if (deleteUser?.errors) {
        throw new Error('Kullanıcı silinemedi.');
      }
      return deleteUser.data;
    } catch (error: any) {
      this.envService.logDebug('deleteUser error', error);
    }
  }

   async updateMember(params: UserData): Promise<any | null> {
    try {
      const updatedUser: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/managementMember/updateMember`, params));
      if (updatedUser?.errors) {
        throw new Error('Kullanıcı güncellenemedi.');
      }
      return updatedUser.data;
    } catch (error: any) {
      this.envService.logDebug('updatedUser error', error);
    }
  }

  async addMember(params: UserData): Promise<any | null> {
    try {
      const addeddUser: any = await firstValueFrom(this.http.post(`${this.envService.apiUrl}/managementMember/addUser`, params));
      if (addeddUser?.errors) {
        throw new Error('Kullanıcı eklenemedi.');
      }
      return addeddUser.data;
    } catch (error: any) {
      this.envService.logDebug('addeddUser error', error);
    }
  }
}
