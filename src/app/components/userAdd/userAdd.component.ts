import { Component, ViewChild } from '@angular/core';
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { CountryComponent } from '../country/country.component';
import { ProvinceComponent } from '../province/province.component';
import { AreaComponent } from '../area/area.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { UserService } from '../../../services/user.service';
@Component({
  selector: 'app-component-userAdd',
  standalone: true,
  imports: [Dialog, ToggleSwitch, ToastModule, MessageModule, AreaComponent, ProvinceComponent, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './userAdd.component.html',
})

export class UserAddComponent {
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
      countryId: null,
      areaId: null,
      provinceId: null,
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
  };

  return Object.values(requiredFields).every(isValid => isValid);
}

   async onSave(form: any) {
    console.log('Form submitted with value:', this.userData);
    const isAngularFormValid = form.valid;
    const isCustomDataValid = this.isFormDataValid();
    const isOverallValid = isAngularFormValid && isCustomDataValid;

     if (!isOverallValid) {
      console.log('Form is invalid:', form);
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
      console.log('add result:', result);
      if (result) {
        this.messageService.add({ severity: 'info', summary: 'Onaylandı', detail: 'Yeni Kullanıcı Eklendi' });

        this.visible = false;

        return;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Yeni Kullanıcı Eklenirken ha oluştu' });
      }



  }

  async onCancel(form: any) {
    this.visible = false;
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
