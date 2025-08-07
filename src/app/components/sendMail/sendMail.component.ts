import { Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputIconModule } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MailService } from '../../../services/mail.service';

interface ValueDataType
{
  subject: string;
  content: string;
}

interface EmailParams {
  subject: string;
  toUsers: Array<string>;
  toEmails: Array<string>;
  body: string;
  count: number;
}
interface MailRequestType
{
  toUsers: Array<string>;
  toEmails: Array<string>;
  type: number;
}

@Component({
  selector: 'app-component-sendMail',
  standalone: true,
  imports: [Dialog, ProgressSpinner, ConfirmDialog, ToastModule, MessageModule, EditorModule, ButtonModule, FormsModule, FloatLabel, InputIconModule, InputTextModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sendMail.component.html'
})

export class SendMailComponent {
  visible: boolean = false;
  isLoading: boolean = false;
  valueData: ValueDataType = { subject: "", content: ""};

  mailRequest: MailRequestType = { toEmails: [], toUsers: [], type: 2 };

  constructor(private mailService: MailService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  openDialog(toUsers: Array<string>, toEmails: Array<string>, type: number) {
    this.visible = true;

    this.mailRequest = {
      toEmails,
      toUsers,
      type
    }
  }

   async onSent(form: any) {

    if (form.valid) {

      this.isLoading = true;

      const mailRequest: EmailParams = {
        ...this.mailRequest,
        subject: this.valueData.subject,
        body: this.valueData.content,
        count: this.mailRequest.toEmails.length
      }
      const result = await this.mailService.sendMail(mailRequest);
      if (result) {
        this.messageService.add({ severity: 'info', summary: 'E-Mail', detail: 'E-Mailler Gönderildi' });

        this.visible = false;
        this.valueData = { subject: "", content: ""};

        this.isLoading = false;

        return;
      } else {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'E-Mailler gönderilirken hata oluştu' });
      }
    } else {

      this.confirmationService.confirm({
        target: form.target as EventTarget,
        message: 'Lütfen Zorunlu Alanları Doldurunuz',
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

    if (this.valueData.subject || this.valueData.content) {

      this.confirmationService.confirm({
        target: form.target as EventTarget,
        message: 'Yaptığınız değişiklikler iptal olcaktır devam etmek istiyor musunuz?',
        header: 'Tehlikeli Bölge',
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
          this.valueData = { subject: "", content: ""};

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
