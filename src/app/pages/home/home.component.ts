import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { clone } from 'ramda';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AreaComponent } from '../../components/area/area.component';
import { ProvinceComponent } from '../../components/province/province.component';
import { CountryComponent } from '../../components/country/country.component';
import { UserComponent } from '../../components/user/user.component';
import { UserService } from '../../../services/user.service';
import { UserAddComponent } from '../../components/userAdd/userAdd.component';

interface Column {
    field: string;
    header: string;
}
interface UserParams {
  countryId: number;
  areaId?: number;
  districtId?: number;
  fullName?: string;
  provinceId?: number;
}
interface ValueData {
  id: number;
  fullName: string;
  identificationNumber?: string;
  telephone?: string;
  email?: string;
  createdDate: string;
  updateDate?: string;
  countryName: string;
  provinceName?: string;
  districtName?: string;
  dateOfBirth?: number;
  areaName?: string
}

@Component({
  selector: 'app-pages-home',
  standalone: true,
  imports: [TableModule, CommonModule, Button, FormsModule, ToastModule, InputIconModule, InputTextModule,
    ConfirmDialog, UserAddComponent, CountryComponent, AreaComponent, Tooltip, UserComponent, IconFieldModule, FloatLabel, ProvinceComponent, ProgressSpinner],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomePageComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  private userService = inject(UserService);
  private router = inject(Router);

  @ViewChild(UserComponent) userComponentRef!: UserComponent;
  @ViewChild(UserAddComponent) userAddComponentRef!: UserAddComponent;


  resultData: ValueData[] = [];
  cols: Column[] = [];
  isLoading = false;
  selectedCountry?: number = 1;
  selectedArea?: number = undefined;
  selectedProvince?: number = undefined;
  searchFullName: string = '';

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {}

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

  async onEdit (value: any) {
    this.userComponentRef.edit(clone(value));
  }

  async onAdd () {
    this.userAddComponentRef.add();
  }

  onDelete(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Bu kaydı silmek istiyor musunuz?',
        header: 'Tehlikeli Bölge',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
          label: 'İptal',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Sil',
          severity: 'danger',
        },

        accept: async () => {
          const result = await this.userService.deleteUser(event as unknown as number);
          if (result) {
            this.messageService.add({ severity: 'info', summary: 'Onaylandı', detail: 'Kayıt Silindi' });
            await this.refreshData();

            return;
          }

          this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Kayıt silinemedi.' });
        },
        reject: () => {
            this.messageService.add({ severity: 'error', summary: 'Reddedilmiş', detail: 'Reddettin' });
        },
    });
  }

  private async fetchUserData(): Promise<void> {
    const params: UserParams = {
      countryId: this.selectedCountry || 1,
      areaId: this.selectedArea,
      districtId: undefined, // İlçe kodu henüz kullanılmıyor
      provinceId: this.selectedProvince, // İl kodu henüz kullanılmıyor
      fullName: this.searchFullName || undefined
    }
     try {

      const getUsers = await this.userService.users(params);
      if (getUsers) {
        this.resultData = getUsers;

        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: `${getUsers.length} duyuru yüklendi.`,
          life: 3000
        });
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Bilgi',
          detail: 'Henüz duyuru bulunmamaktadır.',
          life: 3000
        });
      }
    } catch (error: any) {
      console.error('Error fetching getUsers:', error.message);
      this.messageService.add({
        severity: 'error',
        summary: 'Veri Hatası',
        detail: `Duyurular yüklenirken hata: ${error.message}`,
        life: 5000
      });
    }
  }

  async onSearchChange(value: string) {
    if (value.length > 3) {
      // burada API çağrısı vs. yapılabilir
      this.searchFullName = value;
      await this.fetchUserData();
    }
  }

   async onCountrySelected(countryCode: any): Promise<void> {
    this.selectedCountry = countryCode;
    this.selectedArea = undefined;

      // Önce varsa alanları çıkar
    this.cols = this.cols.filter(col =>
      col.field !== 'areaName' && col.field !== 'districtName'
    );

    if (countryCode == 1) {
      // Türkiye için alan kodunu ekle
      this.cols.splice(7, 0, { field: 'areaName', header: 'Bölge' });
      this.cols.splice(9, 0, { field: 'districtName', header: 'İlçe' });

    }

    this.selectedArea = undefined;
    this.selectedProvince = undefined;

    await this.fetchUserData();
  }
   async onAreaSelected(areaCode: any): Promise<void> {
    this.selectedArea = areaCode;

    await this.fetchUserData();
  }
     async onProvinceSelected(provinceCode: any): Promise<void> {
    this.selectedProvince = provinceCode;

    await this.fetchUserData();
  }

  private initializeColumns(): void {
    this.cols = [
      { field: 'id', header: 'id' },
      { field: 'fullName', header: 'Ad Soyad' },
      { field: 'telephone', header: 'Telefon' },
      { field: 'email', header: 'E-mail' },
      { field: 'identificationNumber', header: 'Kimlik Numarası' },
      { field: 'dateOfBirth', header: 'Yaşı' },
      { field: 'countryName', header: 'Ülke' },
      { field: 'provinceName', header: 'İl' },
      { field: 'createdDate', header: 'İlk Oluşturulma Tarihi' },
      { field: 'updateDate', header: 'Güncelleme Tarihi' },
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
