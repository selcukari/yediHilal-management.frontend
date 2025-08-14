import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
interface MemberParams {
  countryId: number;
  areaId?: number;
  searchName?: string;
  provinceId?: number;
}
interface UserDataParams {
  fullName: string;
  countryCode: number;
  isActive: boolean;
  countryId: string;
  areaId: number;
  provinceId: number;
  identificationNumber?: string;
  telephone: bigint;
  isSms: boolean;
  isMail: boolean;
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
      const { countryId, areaId, provinceId, searchName } = params;

      const getMembers: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/management/getMembersBy`,{
        params: {
          countryId ,
          ...(provinceId !== undefined ? {provinceId } : {}),
          ...((searchName == undefined || searchName?.length < 2) ? {} : {searchName}),
          ...((areaId == undefined || countryId != 1) ? { } : {areaId})
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
      const deleteUser: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/management/deleteMember?id=${userId}`, null));
      if (deleteUser?.errors) {
        throw new Error('Üye silinemedi.');
      }
      return deleteUser.data;
    } catch (error: any) {
      this.envService.logDebug('deleteMember error', error);
    }
  }

   async updateMember(params: UserDataParams): Promise<any | null> {
    try {
      const getUpdateMember: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/management/updateMember`, params));

      return getUpdateMember.data;
    } catch (error: any) {
      this.envService.logDebug('getUpdateMember error', error);

      return error.error;
    }
  }

  async addMember(params: UserDataParams): Promise<any | null> {
    try {
      const addeddMember: any = await firstValueFrom(this.http.post(`${this.envService.apiUrl}/management/addMember`, params));

      return addeddMember.data
    } catch (error: any) {
      this.envService.logDebug('addeddMember error', error);

      return error.error;
    }
  }
}
