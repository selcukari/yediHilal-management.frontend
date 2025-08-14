import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { EnvironmentService } from './environment.service';

interface SmsParams {
  message: string;
  toUsers: Array<string>;
  count: number;
  type: number;
}
export interface SmssType {
  id: number;
  message: string;
  toPhoneNumbers: string;
  toUsers: string;
  createdDate: string;
  count: number;
}
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private envService = inject(EnvironmentService);

  constructor(private http: HttpClient) {}


  async smss(type: number): Promise<SmssType[]> {
    try {
      const getSmss: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/managementUser/getSmss`,{
        params: {type}
      }));

      return getSmss.data;
    } catch (error: any) {
      this.envService.logDebug('getSmsss error', error);

      return error.error;
    }
  }

  async sendSms(params: SmsParams): Promise<any| null> {
    try {
      const sendSms: any = await firstValueFrom(this.http.post(`${this.envService.apiUrl}/managementUser/sendSms`, params));

      return sendSms.data;
    } catch (error: any) {
      this.envService.logDebug('sendSms error', error);

      return error.error;
    }
  }
}
