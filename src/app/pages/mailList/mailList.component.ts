import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MailService, MailsType } from '../../../services/mail.service';
import { StripHtmlPipe } from '../../helpers/stripHtml.pipe';
import { Subscription } from 'rxjs';
import { FormatDatePipe } from '../../helpers'
interface Column {
  field: string;
  header: string;
}
@Component({
  selector: 'app-pages-mailList',
  standalone: true,
  imports: [TableModule, StripHtmlPipe, ToastModule, CommonModule, FormsModule, InputIconModule, InputTextModule,
    IconFieldModule, ProgressSpinner, FormatDatePipe],
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
    private mailService: MailService,
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

      const getMails = await this.mailService.mails(type);
      if (getMails) {
        this.resultData = getMails.map(mail => ({
          id: mail.id,
          subject: mail.subject,
          toEmails: mail.toEmails,
          toUsers: mail.toUsers,
          body: mail.body,
          count: mail.count,
          createdDate: mail.createdDate
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
      { field: 'count', header: 'Alıcı Sayısı' },
      { field: 'toUsers', header: 'Alıcı İsimleri' },
      { field: 'toEmails', header: 'Alıcı E-Postaları' },
      { field: 'createdDate', header: 'Gönderim Tarihi' },
    ];
  }

  // Arama fonksiyonu
  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dt.filterGlobal(target.value, 'contains');
  }
}
