import { Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputIconModule } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmailService } from '../../../services/email.service';

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
}
interface EmailRequestType
{
  toUsers: Array<string>;
  toEmails: Array<string>;
  type: number;
}

@Component({
  selector: 'app-component-sendMail',
  standalone: true,
  imports: [Dialog, ConfirmDialog, ToastModule, MessageModule, EditorModule, ButtonModule, FormsModule, FloatLabel, InputIconModule, InputTextModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sendMail.component.html',
})

export class SendMailComponent {
  visible: boolean = false;
  valueData: ValueDataType = { subject: "", content: ""};

  emailRequest: EmailRequestType = { toEmails: [], toUsers: [], type: 2};

  constructor(private emailService: EmailService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  openDialog(toUsers: Array<string>, toEmails: Array<string>, type: number) {
    this.visible = true;

    this.emailRequest = {
      toEmails,
      toUsers,
      type
    }
  }

   async onSent(form: any) {
    console.log('Form submitted with valueData:', this.valueData);

    if (form.valid) {

      const emailRequest: EmailParams = {
        ...this.emailRequest,
        subject: this.valueData.subject,
        body: this.valueData.content
      }
      const result = await this.emailService.sendMail(emailRequest);
      console.log('add result:', result);
      if (result) {
        this.messageService.add({ severity: 'info', summary: 'E-Mail', detail: 'E-Mailler Gönderildi' });

        this.visible = false;
        this.valueData = { subject: "", content: ""};

        return;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'E-Mailler gönderilirken hata oluştu' });
      }
    } else {
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
