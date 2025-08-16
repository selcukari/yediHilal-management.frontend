import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputIconModule } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageService as MessageServiceApi } from '../../../services/sms.service';

interface SmsParams {
  message: string;
  toUsers: Array<string>;
  count: number;
  type: number;
}
interface SmsRequestType
{
  toUsers: Array<string>;
  toPhoneNumbersWithCountryCode: Array<PhoneNumberWithTypes>;
  type: number;
}

interface PhoneNumberWithTypes
{
  telephone: string;
  countryCode: string;
}

@Component({
  selector: 'app-component-sendSms',
  standalone: true,
  imports: [Dialog, ProgressSpinner, FloatLabel, ConfirmDialog, ToastModule, MessageModule, TextareaModule, ButtonModule, FormsModule, InputIconModule, InputTextModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sendSms.component.html'
})

export class SendSmsComponent {
  visible: boolean = false;
  isLoading: boolean = false;
  content: string = "";

  messageRequest: SmsRequestType = { toPhoneNumbersWithCountryCode: [], toUsers: [], type: 2};

  constructor(private messageServiceApi: MessageServiceApi, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  openDialog(toUsers: Array<string>, toPhoneNumbersWithCountryCode: Array<PhoneNumberWithTypes>, type: number) {
    this.visible = true;

    this.messageRequest = {
      toPhoneNumbersWithCountryCode,
      toUsers,
      type
    }
  }

   async onSent(form: any) {

    if (form.valid) {

      this.isLoading = true;

      const messageRequest: SmsParams = {
        ...this.messageRequest,
        message: this.content,
        count: this.messageRequest.toPhoneNumbersWithCountryCode.length
      }
      const result = await this.messageServiceApi.sendSms(messageRequest);
      if (result) {
        this.messageService.add({ severity: 'info', summary: 'E-Mail', detail: 'Mesajlar Gönderildi' });

        this.visible = false;
        this.content = "";

        this.isLoading = false;

        return;
      } else {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Mesajlar gönderilirken hata oluştu' });
      }
    } else {

      this.confirmationService.confirm({
        target: form.target as EventTarget,
        message: 'Lütfen zorunlu alanı doldurunuz!',
        header: 'Uyarı',
        icon: 'pi pi-info-circle',
        rejectVisible: false,
        acceptButtonProps: {
          label: 'Tamam',
          severity: 'success',
        },

        accept: () => {}
      });

      form.control.markAllAsTouched();
    }
  }

  async onCancel(form: any) {

    if (this.content) {

      this.confirmationService.confirm({
        target: form.target as EventTarget,
        message: 'Yaptığınız değişiklikler iptal olacaktır. Devam etmek istiyor musunuz?',
        header: 'Dikkat',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
          label: 'Hayır',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Evet',
          severity: 'danger',
        },

        accept: async () => {

          this.messageService.add({ severity: 'info', summary: 'Onaylandı', detail: 'Değişiklikler iptal edildi' });
          this.visible = false;
          this.content = "";

        },
        reject: () => {
          this.messageService.add({ severity: 'error', summary: 'Reddedilmiş', detail: 'Reddettin' });
          // Dialog açık kalacak - this.visible = false; yok
        },
      });
    } else {
      // Eğer form boşsa direkt kapat
      this.visible = false;
    }
    // Bu satırı kaldırdık: this.visible = false;
    }
}
