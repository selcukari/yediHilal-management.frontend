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


  async members(params: MemberParams): Promise<any| null> {
    try {
      const { countryId, areaId, provinceId, fullName } = params;

      const getMembers: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/management/getMembersBy`,{
        params: {
          countryId ,
          ...(provinceId !== undefined ? {provinceId } : {}),
          ...((fullName == undefined || fullName?.length < 2) ? {} : {fullName}),
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

   async updateMember(params: UserData): Promise<any | null> {
    try {
      const getUpdateMember: any = await firstValueFrom(this.http.put(`${this.envService.apiUrl}/management/updateMember`, params));
      if (getUpdateMember?.errors) {
        throw new Error('Kullanıcı güncellenemedi.');
      }
      return getUpdateMember.data;
    } catch (error: any) {
      this.envService.logDebug('getUpdateMember error', error);
    }
  }

  async addMember(params: UserData): Promise<any | null> {
    try {
      const addeddMember: any = await firstValueFrom(this.http.post(`${this.envService.apiUrl}/management/addMember`, params));
      if (addeddMember?.errors) {
        throw new Error('Üye eklenemedi.');
      }
      return addeddMember.data;
    } catch (error: any) {
      this.envService.logDebug('addeddMember error', error);
    }
  }
}
