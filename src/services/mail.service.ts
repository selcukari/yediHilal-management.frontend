import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient) {}


  async mails(type: number): Promise<MailsType[]> {
    try {
      const getMails: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/managementMember/getMails`,{
        params: {type}
      }));
      if (getMails?.errors) {
        throw new Error('getMails bulunamadı.');
      }
      return getMails.data;
    } catch (error: any) {
      this.envService.logDebug('getMails error', error);
      return [];
    }
  }

  async sendMail(params: EmailParams): Promise<any| null> {
    try {
      const sendMail: any = await firstValueFrom(this.http.post(`${this.envService.apiUrl}/managementMember/sendMail`, params));
      if (sendMail?.errors) {
        throw new Error('sendMail gonderilemedi.');
      }
      return sendMail.data;
    } catch (error: any) {
      this.envService.logDebug('sendMail error', error);
    }
  }
}
