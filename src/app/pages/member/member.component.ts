import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { clone } from 'ramda';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
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
import { RoleComponent } from '../../components/role/role.component';
import { AuthService } from '../../../services/auth.service';
import { SpeedDialComponent } from '../../components/speedDial/speedDial.component';
import { TableColumn } from '../../helpers/repor/pdfHelper';
import { calculateColumnWidthMember } from '../../helpers/repor/calculateColumnWidth';

interface Column {
  field: string;
  header: string;
}
interface UserParams {
  countryId: number;
  areaId?: number;
  fullName?: string;
  provinceId?: number;
  roleId?: number;
}
interface ValueData {
 id: number;
  fullName: string;
  identificationNumber?: string;
  telephone: string;
	dateOfBirth?: number;
  email: string;
  createdDate: string;
  updateDate?: string;
  countryName: string;
  provinceName: string;
  areaName: string;
	roleName?: string;
}

@Component({
  selector: 'app-pages-member',
  standalone: true,
  imports: [TableModule, CommonModule, Button, FormsModule, ToastModule, InputIconModule, InputTextModule,
    ConfirmDialog, SpeedDialComponent, RoleComponent, MemberAddComponent, CountryComponent, AreaComponent, Tooltip, MemberEditComponent, IconFieldModule, ProvinceComponent, ProgressSpinner],
  providers: [MessageService, ConfirmationService],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberPageComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  private memberService = inject(MemberService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild(MemberEditComponent) memberEditComponentRef!: MemberEditComponent;
  @ViewChild(MemberAddComponent) memberAddComponentRef!: MemberAddComponent;


  resultData: ValueData[] = [];
  cols: Column[] = [];
  sendValueData: ValueData[] = [];
  isLoading = false;
  selectedCountry?: number = 1;
  selectedArea?: number = undefined;
  selectedProvince?: number = undefined;
  selectedRole?: number = undefined;
  searchFullName: string = '';
  isDisabledOnlyJunior: boolean = false;
  selectedCountryName: string = 'Türkiye';
  selectedProvinceName: string = '';
  selectedAreaName: string = '';

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {}

  async ngOnInit() {

    this.isDisabledOnlyJunior = this.authService.getCurrentMember()?.roleId == 3; // 3 is Junior role

    this.isLoading = true;

    try {
      // Announcements verilerini yükle
      await this.fetchMemberData();

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

  get pdfTitle(): string {
    if(this.selectedAreaName && this.selectedProvinceName) {
      return `${this.selectedCountryName}/${this.selectedAreaName}/${this.selectedProvinceName} Kullanıcı Raporu`;
    }

    if(this.selectedAreaName) {
      return `${this.selectedCountryName}/${this.selectedAreaName} Üye Raporu`;
    }

    if(this.selectedProvinceName) {
      return `${this.selectedCountryName}/${this.selectedProvinceName} Üye Raporu`;
    }
    return `${this.selectedCountryName}/Tüm İller Üye Raporu`;
  }

  get pdfTableColumns(): TableColumn[] {

    const newCols: Column[] = this.cols.filter(col =>
      col.field != 'updateDate' && col.field != 'areaName');

    return newCols.map(col => ({
      key: col.field,
      title: col.header,
      // İsteğe bağlı olarak genişlik ayarları ekleyebilirsiniz
      width: calculateColumnWidthMember(col.field) // Özel genişlik hesaplama fonksiyonu
    }));
  }

  async onEdit (value: any) {
    if (this.isDisabledOnlyJunior){
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Yetkisiz işlem',
        life: 3000
      });
      return;
    }

    this.memberEditComponentRef.edit(clone(value));
  }

  async onAdd () {
    if (this.isDisabledOnlyJunior){
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Yetkisiz işlem',
        life: 3000
      });
      return;
    }

    this.memberAddComponentRef.add();
  }

  onDelete(event: Event) {
    if (this.isDisabledOnlyJunior){
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Yetkisiz işlem',
        life: 3000
      });
      return;
    }

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
    const params: UserParams = {
      countryId: this.selectedCountry || 1,
      areaId: this.selectedArea,
      provinceId: this.selectedProvince,
      fullName: this.searchFullName || undefined,
      roleId: this.selectedRole || undefined
    }
     try {

      const getMember = await this.memberService.members(params);
      if (getMember) {
        this.resultData = getMember;
        this.sendValueData = this.resultData.map(user => ({
          id: user.id,
          fullName: user.fullName,
          telephone: user.telephone,
          email: user.email,
          identificationNumber: user.identificationNumber,
          dateOfBirth: user.dateOfBirth,
          countryName: user.countryName,
          provinceName: user.provinceName,
          areaName: user.areaName,
          roleName: user.roleName,
          createdDate: this.formatDate(user.createdDate)
        }));

        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: `${getMember.length} üye yüklendi.`,
          life: 3000
        });
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Bilgi',
          detail: 'Henüz üye bulunmamaktadır.',
          life: 3000
        });
      }
    } catch (error: any) {
      console.error('Error fetching getMember:', error.message);
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
      await this.fetchMemberData();
    }
  }

   async onCountrySelected(countryCode: any): Promise<void> {
    this.selectedCountry = countryCode;
    this.selectedArea = undefined;

      // Önce varsa alanları çıkar
    this.cols = this.cols.filter(col => col.field !== 'areaName');

    if (countryCode == 1) {
      // Türkiye için alan kodunu ekle
      this.cols.splice(8, 0, { field: 'areaName', header: 'Bölge' });
    }

    this.selectedArea = undefined;
    this.selectedProvince = undefined;

    await this.fetchMemberData();
  }

  async onAreaSelected(areaCode: any): Promise<void> {
    this.selectedArea = areaCode;

    await this.fetchMemberData();
  }

  async onProvinceSelected(provinceCode: any): Promise<void> {
    this.selectedProvince = provinceCode;

    await this.fetchMemberData();
  }

  async onRoleSelected(roleCode: any): Promise<void> {
    this.selectedRole = roleCode;

    await this.fetchMemberData();
  }

  onAreaSelectedName(areaName: string): void {
    this.selectedAreaName = areaName;
  }

  onCountrySelectedName(countryName: string): void {
    this.selectedCountryName = countryName;
  }

  onProvinceSelectedName(provinceName: string): void {
    this.selectedProvinceName = provinceName;
  }

  private initializeColumns(): void {
    this.cols = [
      { field: 'id', header: 'id' },
      { field: 'fullName', header: 'Ad Soyad' },
      { field: 'roleName', header: 'Rolü' },
      { field: 'telephone', header: 'Telefon' },
      { field: 'email', header: 'E-mail' },
      { field: 'identificationNumber', header: 'Kimlik Numarası' },
      { field: 'dateOfBirth', header: 'Doğum Yılı' },
      { field: 'countryName', header: 'Ülke' },
      { field: 'provinceName', header: 'İl' },
      { field: 'createdDate', header: 'İlk Kayıt Tarih' },
      { field: 'updateDate', header: 'Güncelleme Tarih' },
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
    await this.fetchMemberData();
  }
}
