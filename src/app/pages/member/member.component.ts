import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { clone } from 'ramda';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { CommonModule, formatDate } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
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
import { MemberEditComponent } from '../../components/memberEdit/memberEdit.component';
import { MemberService } from '../../../services/member.service';
import { MemberAddComponent } from '../../components/memberAdd/memberAdd.component';
import { SpeedDialComponent } from '../../components/speedDial/speedDial.component';
import { TableColumn } from '../../helpers/repor/pdfHelper';
import { calculateColumnWidthMember } from '../../helpers/repor/calculateColumnWidth';
import { FormatDatePipe } from '../../helpers'
import { ColumnDefinition } from '../../helpers/repor/exportToExcel'

interface Column {
  field: string;
  header: string;
}
interface MemberParams {
  countryId: number;
  areaId?: number;
  searchName?: string;
  provinceId?: number;
}
export interface ValueData {
  id: number;
  fullName: string;
  identificationNumber?: string;
  telephone: string;
	dateOfBirth?: number;
  email: string;
  countryCode?: string;
  createdDate: string;
  updateDate?: string;
  countryName: string;
  provinceName: string;
  isSms?: boolean;
  isMail?: boolean;
  areaName: string;
	roleName?: string;
}

@Component({
  selector: 'app-pages-member',
  standalone: true,
  imports: [TableModule, CommonModule, Button, FormsModule, ToastModule, InputIconModule, InputTextModule, FormatDatePipe,
    ConfirmDialog, SpeedDialComponent, MemberAddComponent, CountryComponent, AreaComponent, Tooltip, MemberEditComponent, IconFieldModule, ProvinceComponent, ProgressSpinner],
  providers: [MessageService, ConfirmationService],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberPageComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  private memberService = inject(MemberService);
  private router = inject(Router);

  @ViewChild(MemberEditComponent) memberEditComponentRef!: MemberEditComponent;
  @ViewChild(MemberAddComponent) memberAddComponentRef!: MemberAddComponent;


  resultData: ValueData[] = [];
  cols: Column[] = [];
  sendValueData: ValueData[] = [];
  isLoading = false;
  turkishCountryCode = 1;
  selectedCountry?: number
  selectedCountryName: string = 'Türkiye';
  selectedProvinceName: string = '';
  selectedAreaName: string = '';
  selectedArea?: number = undefined;
  selectedProvince?: number = undefined;
  searchName: string = '';

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {}

  async ngOnInit() {

      // await this.fetchMemberData();

      // Tablo kolonlarını tanımla
      this.initializeColumns();

  }

  get pdfTitle(): string {
    if(this.selectedCountryName === 'Türkiye' && this.selectedAreaName && this.selectedProvinceName) {
      return `${this.selectedCountryName}/${this.selectedAreaName}/${this.selectedProvinceName} Üye Raporu`;
    }

    if(this.selectedAreaName && !this.selectedProvince) {
      return `${this.selectedCountryName}/${this.selectedAreaName} Üye Raporu`;
    }

    if(this.selectedProvinceName && !this.selectedAreaName) {
      return `${this.selectedCountryName}/${this.selectedProvinceName} Üye Raporu`;
    }

    return `${this.selectedCountryName}/Tüm İller Üye Raporu`;
  }

  get pdfTableColumns(): TableColumn[] {

    const newCols: Column[] = this.cols.filter(col =>
      col.field != 'updateDate' && col.field != 'areaName' && col.field != 'countryCode');

    return newCols.map(col => ({
      key: col.field,
      title: col.header,
      // İsteğe bağlı olarak genişlik ayarları ekleyebilirsiniz
      width: calculateColumnWidthMember(col.field) // Özel genişlik hesaplama fonksiyonu
    }));
  }

  get excelTableColumns(): ColumnDefinition[] {

    const newCols = this.cols.filter(col =>
      col.field != 'updateDate' && col.field != 'areaName' && col.field != 'countryCode');

    return newCols.map(col => ({
      key: col.field as keyof ValueData,
      header: col.header,
      // İsteğe bağlı olarak genişlik ayarları ekleyebilirsiniz
      // format: // Özel genişlik hesaplama fonksiyonu
    }));
  }


  async onEdit (value: any) {
    this.memberEditComponentRef.edit(clone(value));
  }

  async onAdd () {
    this.memberAddComponentRef.add();
  }

  onDelete(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Bu kaydı silmek istiyor musunuz?',
      header: 'Dikkat',
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
        const result = await this.memberService.deleteMember(event as unknown as number);
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

  private async fetchMemberData(): Promise<void> {
    this.isLoading = true;

    const params: MemberParams = {
      countryId: this.selectedCountry || 1,
      areaId: this.selectedArea,
      provinceId: this.selectedProvince, // İl kodu henüz kullanılmıyor
      searchName: this.searchName || undefined
    }
     try {

      const getMembers = await this.memberService.members(params);
      if (getMembers) {
        this.resultData = getMembers;
        this.sendValueData = this.resultData.map(member => ({
          id: member.id,
          fullName: member.fullName,
          telephone: `+${member.countryCode}${member.telephone}`,
          email: member.email,
          identificationNumber: member.identificationNumber,
          dateOfBirth: member.dateOfBirth,
          countryName: member.countryName,
          provinceName: member.provinceName,
          areaName: member.areaName,
          isSms: member.isSms,
          isMail: member.isMail,
          createdDate: formatDate(member.createdDate, 'yyyy-MM-dd', 'tr-TR')
        }));
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Bilgi',
          detail: 'Henüz üye bulunmamaktadır.',
          life: 3000
        });
      }
      this.isLoading = false;
    } catch (error: any) {
      console.error('Error fetching getMembers:', error.message);
      this.messageService.add({
        severity: 'error',
        summary: 'Veri Hatası',
        detail: `Üye yüklenirken hata: ${error.message}`,
        life: 5000
      });
    }
  }

  async onSearchChange(value: string) {
    if (value.length > 3) {
      // burada API çağrısı vs. yapılabilir
      this.searchName = value;
    }
  }

   onCountrySelected(countryCode: any): void {
    this.selectedCountry = countryCode;
    this.selectedArea = undefined;

      // Önce varsa alanları çıkar
    this.cols = this.cols.filter(col => col.field !== 'areaName');

    if (countryCode == 1) {
      // Türkiye için alan kodunu ekle
      this.cols.splice(9, 0, { field: 'areaName', header: 'Bölge' });
    }

    this.selectedArea = undefined;
    this.selectedProvince = undefined;
  }
  onAreaSelected(areaCode: any): void {
    this.selectedArea = areaCode;
  }

  onCountrySelectedName(countryName: string): void {
    this.selectedCountryName = countryName;

    this.selectedAreaName = "";
    this.selectedProvinceName = "";
  }

  onProvinceSelectedName(provinceName: string): void {
    this.selectedProvinceName = provinceName;
  }

  onAreaSelectedName(areaName: string): void {
    this.selectedAreaName = areaName;

    this.selectedProvinceName = "";
  }

  onProvinceSelected(provinceCode: any): void {
    this.selectedProvince = provinceCode;
  }

  private initializeColumns(): void {
    this.cols = [
      { field: 'id', header: 'Id' },
      { field: 'fullName', header: 'Ad Soyad' },
      { field: 'countryCode', header: 'Ülke Kodu' },
      { field: 'telephone', header: 'Telefon' },
      { field: 'email', header: 'E-mail' },
      { field: 'isSms', header: 'Sms'},
      { field: 'isMail', header: 'Mail'},
      { field: 'identificationNumber', header: 'Kimlik' },
      { field: 'dateOfBirth', header: 'Doğum Yılı' },
      { field: 'countryName', header: 'Ülke' },
      { field: 'provinceName', header: 'İl' },
      { field: 'createdDate', header: 'İlk Kayıt' },
      { field: 'updateDate', header: 'Güncelleme' },
    ];
  }

  onPageSelect(route: any): void {

    if(route && route.code) {
      this.router.navigate([`/${route.code}`]);
    }
  }

  // Arama fonksiyonu
  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dt.filterGlobal(target.value, 'contains');
  }

  // Refresh fonksiyonu
  async refreshData(): Promise<void> {

    if (this.selectedCountry == this.turkishCountryCode && this.selectedArea) {

      await this.fetchMemberData();
    } else if (this.selectedCountry && this.selectedCountry != this.turkishCountryCode) {

      await this.fetchMemberData();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Ülke ve bölge seçimini yapınız!',
        life: 3000
      });
    }
  }
}
