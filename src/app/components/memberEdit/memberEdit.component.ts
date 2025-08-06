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
import { MemberService } from '../../../services/member.service';
import { RoleComponent } from '../role/role.component';

@Component({
  selector: 'app-component-memberEdit',
  standalone: true,
  imports: [Dialog, RoleComponent, ToggleSwitch, ToastModule, MessageModule, AreaComponent, ProvinceComponent, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './memberEdit.component.html',
})

export class MemberEditComponent {
  visible: boolean = false;
  memberData: any;
  changeAreaCode?: number;
  changeProvinceCode?: number;

  constructor(private memberService: MemberService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  ngOnInit() {
    if (!this.memberData) {
      this.memberData = this.defaultmemberData();
    }
  }

  edit(newValue: any) {

    this.visible = true;
    this.memberData = newValue || this.defaultmemberData();
  }

  defaultmemberData(): any {
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
    provinceId: !!this.memberData.provinceId,
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


      const updateMemberValue = {
        Id: this.memberData.id,
        fullName: this.memberData.fullName,
        identificationNumber: this.memberData.identificationNumber,
        telephone: this.memberData.telephone,
        email: this.memberData.email,
        dateOfBirth: this.memberData.dateOfBirth,
        countryId: this.memberData.countryId,
        areaId: this.memberData.areaId,
        provinceId: this.memberData.provinceId,
        isActive: this.memberData.isActive,
        createdDate: this.memberData.createdDate,
        roleId: this.memberData.roleId,
        ...(this.memberData.id ? {updateDate: new Date().toISOString() } : {})
      }
      const result = await this.memberService.updateMember(updateMemberValue);
      if (result) {
        this.messageService.add({ severity: 'info', summary: 'Onaylandı', detail: 'Kullanıcı Güncellendi' });

        this.visible = false;

        return;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Kullanıcı Güncellenemedi' });
      }



  }

  async onCancel(form: any) {
    this.visible = false;
  }

  onCountrySelected(countryCode: any): void {
    this.memberData.countryId = countryCode;
  }

  onRoleSelected(roleCode: any): void {
    this.memberData.roleId = roleCode;
  }

  onProvinceSelected(provinceCode: any): void {
    this.memberData.provinceId = provinceCode;
    this.changeProvinceCode = provinceCode;
  }
  onAreaSelected(areaCode: any): void {
    this.memberData.areaId = areaCode;

    this.memberData.provinceId = undefined;
    this.changeAreaCode = areaCode;
  }
}
