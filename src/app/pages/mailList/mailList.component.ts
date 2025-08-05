import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { ProgressSpinner } from 'primeng/progressspinner';
import { EmailService, MailsType } from '../../../services/email.service';
import { StripHtmlPipe } from '../../helpers/stripHtml.pipe';
import { Subscription } from 'rxjs';
interface Column {
  field: string;
  header: string;
}
@Component({
  selector: 'app-pages-mailList',
  standalone: true,
  imports: [TableModule, StripHtmlPipe, ToastModule, CommonModule, Button, FormsModule, InputIconModule, InputTextModule,
    IconFieldModule, ProgressSpinner, Tooltip],
  providers: [MessageService],
  templateUrl: './mailList.component.html',
  styleUrl: './mailList.component.scss'
})
export class MailListPageComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;

  resultData: MailsType[] = [];
  cols: Column[] = [];
  isLoading = false;
  typeId: number = 2;

  private routeSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    try {
      // Route parametrelerini dinle
      this.routeSubscription = this.route.paramMap.subscribe(async (params) => {
        const typeParam = params.get('type');
        if (typeParam) {
          const newTypeId = +typeParam;

          // TypeId değişti mi kontrol et
          if (this.typeId !== newTypeId) {

            this.typeId = newTypeId;

            // Yeni type ile veri yükle
            await this.fetchMemberData(this.typeId);
          }
        } else {

          // Parametre yoksa default değer ile yükle
          await this.fetchMemberData(this.typeId);
        }

        await this.fetchMemberData(this.typeId);

      });

      this.initializeColumns();

    } catch (error) {
      console.error('Initialization error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Sayfa yüklenirken bir hata oluştu.',
        life: 3000
      });
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    // Memory leak önlemek için subscription'ı temizle
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private async fetchMemberData(type: number): Promise<void> {
    this.isLoading = true;

    try {
      console.log('Fetching data for type:', type);

      const getMails = await this.emailService.mails(type);
      if (getMails) {
        this.resultData = getMails.map(mail => ({
          id: mail.id,
          subject: mail.subject,
          toEmails: mail.toEmails,
          toUsers: mail.toUsers,
          body: mail.body,
          createdDate: this.formatDate(mail.createdDate)
        }));

        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: `${getMails.length} mail yüklendi.`,
          life: 3000
        });
      } else {
        this.resultData = [];
        this.messageService.add({
          severity: 'info',
          summary: 'Bilgi',
          detail: 'Henüz mail bulunmamaktadır.',
          life: 3000
        });
      }
    } catch (error: any) {
      console.error('Error fetching getMails:', error.message);
      this.resultData = [];
      this.messageService.add({
        severity: 'error',
        summary: 'Veri Hatası',
        detail: `Mail yüklenirken hata: ${error.message}`,
        life: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }

  private initializeColumns(): void {
    this.cols = [
      { field: 'id', header: 'id' },
      { field: 'subject', header: 'Konu' },
      { field: 'body', header: 'İçerik' },
      { field: 'toUsers', header: 'Alıcılar İsimleri' },
      { field: 'toEmails', header: 'Alıçılar' },
      { field: 'createdDate', header: 'Gönderim Tarihi' },
    ];
  }

  // Utility fonksiyonlar
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return dateString;
    }
  }

  // Arama fonksiyonu
  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dt.filterGlobal(target.value, 'contains');
  }

  // Refresh fonksiyonu
  async refreshData(): Promise<void> {
    await this.fetchMemberData(this.typeId);
  }
}
