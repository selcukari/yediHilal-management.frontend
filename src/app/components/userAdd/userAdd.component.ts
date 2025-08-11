import { Component, EventEmitter, Output } from '@angular/core';
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
import { isEquals } from '../../helpers'
import { UserService } from '../../../services/user.service';
@Component({
  selector: 'app-component-userAdd',
  standalone: true,
  imports: [Dialog, ToggleSwitch, ConfirmDialog, ToastModule, MessageModule, AreaComponent, ProvinceComponent, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './userAdd.component.html',
})

export class UserAddComponent {
  @Output() onSaveSuccess = new EventEmitter<void>();

  visible: boolean = false;
  userData: any;
  changeAreaCode?: number;
  changeProvinceCode?: number;
  changeCountryCode?: number;

  constructor(private userService: UserService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  ngOnInit() {
    if (!this.userData) {
      this.userData = this.defaultUserData();
    }
  }

  add() {
    this.visible = true;
    this.userData = this.defaultUserData();
  }

  defaultUserData(): any {
    return {
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
  }

  // Validasyon fonksiyonu
private isFormDataValid(): boolean {
  const requiredFields = {
    provinceId: !!this.userData.provinceId,
    countryId: !!this.userData.countryId,
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


    const newUserValue = {
      fullName: this.userData.fullName,
      identificationNumber: this.userData.identificationNumber,
      telephone: this.userData.telephone,
      email: this.userData.email,
      dateOfBirth: this.userData.dateOfBirth,
      countryId: this.userData.countryId,
      provinceId: this.userData.provinceId,
      isActive: this.userData.isActive,
      areaId: (this.userData.areaId || 8)
    }
    const result = await this.userService.addUser(newUserValue);
    if (result) {
      this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Yeni Kullanıcı Eklendi' });
      this.onSaveSuccess.emit();
      this.visible = false;

      return;
    } else {
      this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Yeni Kullanıcı Eklenirken hata oluştu' });
    }
  }

  async onCancel(form: any) {
    if (!isEquals(this.defaultUserData(), this.userData)) {

      this.confirmationService.confirm({
        target: form.target as EventTarget,
        message: 'Yaptığınız değişiklikler iptal olacaktır. Devam etmek istiyor musunuz?',
        header: 'Dikkat',
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
          this.userData = this.defaultUserData();
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

  onCountrySelected(countryCode: any): void {
    this.userData.countryId = countryCode;
    this.changeCountryCode = countryCode;
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
