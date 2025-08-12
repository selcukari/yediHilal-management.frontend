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
import { UserEditComponent } from '../../components/userEdit/userEdit.component';
import { UserService } from '../../../services/user.service';
import { UserAddComponent } from '../../components/userAdd/userAdd.component';
import { RoleComponent } from '../../components/role/role.component';
import { AuthService } from '../../../services/auth.service';
import { SpeedDialComponent } from '../../components/speedDial/speedDial.component';
import { TableColumn } from '../../helpers/repor/pdfHelper';
import { calculateColumnWidthUser } from '../../helpers/repor/calculateColumnWidth';

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
  selector: 'app-pages-user',
  standalone: true,
  imports: [TableModule, CommonModule, Button, FormsModule, ToastModule, InputIconModule, InputTextModule,
    ConfirmDialog, SpeedDialComponent, RoleComponent, UserAddComponent, CountryComponent, AreaComponent, Tooltip,
    UserEditComponent, IconFieldModule, ProvinceComponent, ProgressSpinner],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserPageComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild(UserEditComponent) userEditComponentRef!: UserEditComponent;
  @ViewChild(UserAddComponent) userAddComponentRef!: UserAddComponent;


  resultData: ValueData[] = [];
  cols: Column[] = [];
  sendValueData: ValueData[] = [];
  isLoading = false;
  selectedCountry?: number = 1;
  selectedArea?: number = undefined;
  selectedProvince?: number = undefined;
  selectedRole?: number = undefined;
  searchFullName: string = '';
  selectedCountryName: string = 'Türkiye';
  selectedProvinceName: string = '';
  selectedAreaName: string = '';

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

  get isDisabledOnlySenior(): boolean {
    return this.authService.getCurrentUser()?.roleId == 2; // 3 is Senior role
  }
  get isDisabledOnlyAdmin(): boolean {
    return this.authService.getCurrentUser()?.roleId == 1; // 3 is Admin role
  }

  get pdfTitle(): string {
    if(this.selectedAreaName && this.selectedProvinceName) {
      return `${this.selectedCountryName}/${this.selectedAreaName}/${this.selectedProvinceName} Kullanıcı Raporu`;
    }

    if(this.selectedAreaName) {
      return `${this.selectedCountryName}/${this.selectedAreaName} Kullanıcı Raporu`;
    }

    if(this.selectedProvinceName) {
      return `${this.selectedCountryName}/${this.selectedProvinceName} Kullanıcı Raporu`;
    }
    return `${this.selectedCountryName}/Tüm İller Kullanıcı Raporu`;
  }

  get pdfTableColumns(): TableColumn[] {

    const newCols: Column[] = this.cols.filter(col =>
      col.field != 'updateDate' && col.field != 'areaName');

    return newCols.map(col => ({
      key: col.field,
      title: col.header,
      // İsteğe bağlı olarak genişlik ayarları ekleyebilirsiniz
      width: calculateColumnWidthUser(col.field) // Özel genişlik hesaplama fonksiyonu
    }));
  }

  async onEdit (value: any) {
    if (
      (this.isDisabledOnlySenior && (value.roleId != 1)) || this.isDisabledOnlyAdmin
    ){

      this.userEditComponentRef.edit(clone(value));

      return;
    }

    this.messageService.add({
      severity: 'warn',
      summary: 'Uyarı',
      detail: 'Yetkisiz işlem',
      life: 3000
    });
  }

  async onAdd () {
    this.userAddComponentRef.add();
  }

  onDelete(event: Event, roleId: number) {
    if (
      (this.isDisabledOnlySenior && (roleId as number != 1)) || this.isDisabledOnlyAdmin
    ){

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

      return;
    }

    this.messageService.add({
      severity: 'warn',
      summary: 'Uyarı',
      detail: 'Yetkisiz işlem',
      life: 3000
    });
  }

  private async fetchUserData(): Promise<void> {
    const params: UserParams = {
      countryId: this.selectedCountry || 1,
      areaId: this.selectedArea,
      provinceId: this.selectedProvince,
      fullName: this.searchFullName || undefined,
      roleId: this.selectedRole || undefined
    }
     try {

      const getUser = await this.userService.users(params);
      if (getUser) {
        this.resultData = getUser;
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
          detail: `${getUser.length} Kullanıcı yüklendi.`,
          life: 3000
        });
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Bilgi',
          detail: 'Henüz Kullanıcı bulunmamaktadır.',
          life: 3000
        });
      }
    } catch (error: any) {
      console.error('Error fetching getUser:', error.message);
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
    this.cols = this.cols.filter(col => col.field !== 'areaName');

    if (countryCode == 1) {
      // Türkiye için alan kodunu ekle
      this.cols.splice(8, 0, { field: 'areaName', header: 'Bölge' });
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

  async onRoleSelected(roleCode: any): Promise<void> {
    this.selectedRole = roleCode;

    await this.fetchUserData();
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
      { field: 'id', header: 'Id' },
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
    await this.fetchUserData();
  }
}
