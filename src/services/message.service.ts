import { Injectable, inject } from '@angular/core';
import axios from 'axios';
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

constructor() {
  }

  async messages(type: number): Promise<MessagesType[]> {
    try {
      const getMessages = await axios.get(`${this.envService.apiUrl}/managementMember/getMessages`,{
        params: {type}
      });
      if (!getMessages.data.data) {
        throw new Error('getMessages bulunamadı.');
      }
      return getMessages.data.data;
    } catch (error: any) {
      this.envService.logDebug('getMessages error', error);
      return [];
    }
  }

  async sendMessage(params: MessageParams): Promise<any| null> {
    try {
      const sendMessage = await axios.post(`${this.envService.apiUrl}/managementMember/sendMessage`, params);
      if (!sendMessage.data.data) {
        throw new Error('sendMessage gonderilemedi.');
      }
      return sendMessage.data.data;
    } catch (error: any) {
      this.envService.logDebug('sendMessage error', error);
    }
  }
}
