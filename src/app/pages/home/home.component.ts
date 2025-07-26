import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Listbox } from 'primeng/listbox';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AreaComponent } from '../../components/area/area.component';
import { ProvinceComponent } from '../../components/province/province.component';
import { CountryComponent } from '../../components/country/country.component';
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

interface City {
    name: string,
    code: string
}

@Component({
  selector: 'app-pages-home',
  standalone: true,
  imports: [TableModule, CommonModule, Button, FormsModule, ToastModule, Listbox,
    CountryComponent, AreaComponent, ProvinceComponent, ProgressSpinner],
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  messageService = inject(MessageService);
  private authService = inject(AuthService);

  private router = inject(Router);
  pages!: City[];

  resultData: ValueData[] = [];
  cols: Column[] = [];
  isLoading = false;
  selectedCountry?: number = 1;
  selectedArea?: number = undefined;

  async ngOnInit() {
    this.isLoading = true;

    try {
      // Announcements verilerini yükle
      await this.fetchUserData();

      // Tablo kolonlarını tanımla
      this.initializeColumns();

      this.pages = [
            { name: 'Kullanıcı Yönetimi', code: '/' },
            { name: 'Üye Yönetimi', code: 'members' },
            { name: 'Sayfa-3', code: 'LDN' },
        ];

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

   onCountrySelected(countryCode: any): void {
    console.log('Selected countryCode11:', countryCode);
    this.selectedCountry = countryCode;
    this.selectedArea = undefined;
  }
   onAreaSelected(areaCode: any): void {
    console.log('Selected areaCode1:', areaCode);
    this.selectedArea = areaCode;
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

  onPageSelect(route: any): void {
    console.log('Selected route:', route);

    if(route && route.code) {
      this.router.navigate([`/${route.code}`]);
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
