import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';


interface MemberParams {
  countryId: number;
  areaId?: number;
  districtId?: number;
  fullName?: string;
  provinceId?: number;
  roleId?: number;
}

interface UserData {
  fullName: string;
  isActive: boolean;
  countryId: number;
  areaId: number;
  provinceId: number;
  roleId: number;
  districtId?: number;
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

  async members(params: MemberParams): Promise<any| null> {
    try {
      const { countryId, areaId, provinceId, fullName, districtId, roleId } = params;

      const getMembers = await axios.get(`${this.envService.apiUrl}/managementMember/getMembersBy`,{
        params: {
          countryId ,
          ...(provinceId !== undefined ? {provinceId } : {}),
          ...((fullName == undefined || fullName?.length < 2) ? {} : {fullName}),
          ...((districtId == undefined || countryId != 1) ? {} : {districtId}),
          ...((areaId == undefined || countryId != 1) ? { } : {areaId}),
          ...(roleId !== undefined ? {roleId } : {}),
        }});
      if (!getMembers.data.data) {
        throw new Error('getMembers bulunamadı.');
      }
      return getMembers.data.data;
    } catch (error: any) {
      this.envService.logDebug('getMembers error', error);
    }
  }

  async deleteMember(userId: number): Promise<any | null> {
    try {
      const deleteUser = await axios.put(`${this.envService.apiUrl}/managementMember/deleteUser?id=${userId}`);
      if (!deleteUser.data.data) {
        throw new Error('Kullanıcı silinemedi.');
      }
      return deleteUser.data.data;
    } catch (error: any) {
      this.envService.logDebug('deleteUser error', error);
    }
  }

   async updateMember(params: UserData): Promise<any | null> {
    try {
      const updatedUser = await axios.put(`${this.envService.apiUrl}/managementMember/updateUser`, params);
      if (!updatedUser.data.data) {
        throw new Error('Kullanıcı güncellenemedi.');
      }
      return updatedUser.data.data;
    } catch (error: any) {
      this.envService.logDebug('updatedUser error', error);
    }
  }

  async addMember(params: UserData): Promise<any | null> {
    try {
      const addeddUser = await axios.post(`${this.envService.apiUrl}/managementMember/addUser`, params);
      if (!addeddUser.data.data) {
        throw new Error('Kullanıcı eklenemedi.');
      }
      return addeddUser.data.data;
    } catch (error: any) {
      this.envService.logDebug('addeddUser error', error);
    }
  }
}
