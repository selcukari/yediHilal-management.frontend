import { Component, ViewChild } from '@angular/core';
import { clone } from 'ramda';
import { IconFieldModule } from 'primeng/iconfield';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { InputIconModule } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CountryComponent } from '../country/country.component';
import { ProvinceComponent } from '../province/province.component';
import { AreaComponent } from '../area/area.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { UserService } from '../../../services/user.service';
import { isEquals } from '../../helpers';

@Component({
  selector: 'app-component-userEdit',
  standalone: true,
  imports: [Dialog, ToggleSwitch, ConfirmDialog, ToastModule, MessageModule, AreaComponent, ProvinceComponent, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './userEdit.component.html',
})

export class UserEditComponent {
  visible: boolean = false;
  userData: any;
  changeAreaCode?: number;
  changeProvinceCode?: number;
  lazyValue: any = null;
  defaultUserData = {
    id: null,
    fullName: "",
    isActive: true,
    countryId: undefined,
    areaId: undefined,
    provinceId: undefined,
    identificationNumber: null,
    telephone: null,
    email: null,
    dateOfBirth: null
  };

  constructor(private userService: UserService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  ngOnInit() {
    if (!this.userData) {
      this.userData = this.defaultUserData;
    }
  }

  async edit(newValue: any) {
    this.visible = true;
    this.userData = newValue || this.defaultUserData;
    this.changeAreaCode = this.userData.areaId;

    this.lazyValue = clone(newValue);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

    // Validasyon fonksiyonu
  private isFormDataValid(): boolean {
    const requiredFields = {
      provinceId: !!this.userData.provinceId,
    };

    return Object.values(requiredFields).every(isValid => isValid);
  }

  async onSave(form: any) {
    const isAngularFormValid = form.valid;
    const isCustomDataValid = this.isFormDataValid();
    const isOverallValid = isAngularFormValid && isCustomDataValid;

    if (!isOverallValid) {
      if (form.control?.markAllAsTouched) {
        form.control.markAllAsTouched();
      }

      // Manuel olarak touched durumu da ayarlanabilir (isteğe bağlı)
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });

     this.messageService.add({ severity: 'warn', summary: 'Eksik Alan', detail: 'Lütfen gerekli alanları doldurunuz.' });
     return;
   }

    const updateUserValue = {
      Id: this.userData.id,
      fullName: this.userData.fullName,
      identificationNumber: this.userData.identificationNumber,
      telephone: this.userData.telephone,
      email: this.userData.email,
      dateOfBirth: this.userData.dateOfBirth,
      countryId: this.userData.countryId,
      areaId: this.userData.areaId,
      provinceId: this.userData.provinceId,
      isActive: this.userData.isActive,
      createdDate: this.userData.createdDate,
      ...(this.userData.id ? {updateDate: new Date().toISOString() } : {})
    }

    const result = await this.userService.updateUser(updateUserValue);
    if (result) {
      this.messageService.add({ severity: 'info', summary: 'Onaylandı', detail: 'Kullanıcı Güncellendi' });

      this.visible = false;

      return;
    } else {
      this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Kullanıcı Güncellenemedi' });
    }
  }

  async onCancel(form: any) {
    if (!isEquals(this.lazyValue, this.userData)) {

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
          this.userData = this.defaultUserData;
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


  onProvinceSelected(provinceCode: any): void {
    this.userData.provinceId = provinceCode;
    this.changeProvinceCode = provinceCode;
  }
  onAreaSelected(areaCode: any): void {
    this.userData.areaId = areaCode;

    this.userData.provinceId = undefined;
    this.changeAreaCode = areaCode;
  }
}
