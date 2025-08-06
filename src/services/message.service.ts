import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { EnvironmentService } from './environment.service';

interface MessageParams {
  message: string;
  toUsers: Array<string>;
  count: number;
  type: number;
}
export interface MessagesType {
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


  async messages(type: number): Promise<MessagesType[]> {
    try {
      const getMessages: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/managementMember/getMessages`,{
        params: {type}
      }));
      if (getMessages?.errors) {
        throw new Error('getMessages bulunamadı.');
      }
      return getMessages.data;
    } catch (error: any) {
      this.envService.logDebug('getMessages error', error);
      return [];
    }
  }

  async sendMessage(params: MessageParams): Promise<any| null> {
    try {
      const sendMessage: any = await firstValueFrom(this.http.post(`${this.envService.apiUrl}/managementMember/sendMessage`, params));
      if (sendMessage?.errors) {
        throw new Error('sendMessage gonderilemedi.');
      }
      return sendMessage.data;
    } catch (error: any) {
      this.envService.logDebug('sendMessage error', error);
    }
  }
}
