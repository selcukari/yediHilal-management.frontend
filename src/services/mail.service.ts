import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { EnvironmentService } from './environment.service';


interface EmailParams {
  subject: string;
  toUsers: Array<string>;
  toEmails: Array<string>;
  body: string;
  count: number;
}

export interface MailsType {
  id: number;
  body: string;
  toEmails: string;
  subject: string;
  toUsers: string;
  createdDate: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private envService = inject(EnvironmentService);

constructor() {
  }

  async mails(type: number): Promise<MailsType[]> {
    try {
      const getMails = await axios.get(`${this.envService.apiUrl}/managementMember/getMails`,{
        params: {type}
      });
      if (!getMails.data.data) {
        throw new Error('getMails bulunamadı.');
      }
      return getMails.data.data;
    } catch (error: any) {
      this.envService.logDebug('getMails error', error);
      return [];
    }
  }

  async sendMail(params: EmailParams): Promise<any| null> {
    try {
      const sendMail = await axios.post(`${this.envService.apiUrl}/managementMember/sendMail`, params);
      if (!sendMail.data.data) {
        throw new Error('sendMail gonderilemedi.');
      }
      return sendMail.data.data;
    } catch (error: any) {
      this.envService.logDebug('sendMail error', error);
    }
  }
}
