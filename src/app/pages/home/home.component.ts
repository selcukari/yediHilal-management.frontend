import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AuthService } from '../../../services/auth.service';
import { Table } from 'primeng/table';

interface Column {
    field: string;
    header: string;
}

interface ValueData {
  isActive: boolean;
  date: string;
  title: string;
  message: string;
  link: string;
  category: string;
  owner: {
    name: string;
    key: string;
  };
  [subgroup: string]: any;
}

interface ISancaktarlar {
  announcements: { [key: string]: ValueData };
  [subgroup: string]: any;
}

interface AnnouncementData {
  sancaktarlar: ISancaktarlar;
}

@Component({
  selector: 'app-pages-home',
  standalone: true,
  imports: [TableModule, CommonModule, Button, ToastModule, ProgressSpinner],
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  messageService = inject(MessageService);
  private authService = inject(AuthService);

  resultData: ValueData[] = [];
  cols: Column[] = [];
  isLoading = false;

  async ngOnInit() {
    this.isLoading = true;

    try {
      // Announcements verilerini yükle
      await this.fetchUserData();

      // Tablo kolonlarını tanımla
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

  private async fetchUserData(): Promise<void> {

  }

  private initializeColumns(): void {
    this.cols = [
      { field: 'title', header: 'Duyuru Başlığı' },
      { field: 'category', header: 'Kategori' },
      { field: 'message', header: 'Mesaj' },
      { field: 'link', header: 'Link' },
      { field: 'date', header: 'Tarih' },
      { field: 'owner.name', header: 'Duyuru Sahibi' }
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

  openLink(link: string): void {
    if (link && link.startsWith('http')) {
      window.open(link, '_blank');
    }
  }

  // Arama fonksiyonu
  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dt.filterGlobal(target.value, 'contains');
  }

  // Refresh fonksiyonu
  async refreshData(): Promise<void> {
    await this.fetchUserData();
  }
}
