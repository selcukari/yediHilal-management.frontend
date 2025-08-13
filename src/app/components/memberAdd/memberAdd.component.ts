import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { NgForm } from '@angular/forms';
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
import { MemberService } from '../../../services/member.service';

@Component({
  selector: 'app-component-memberAdd',
  standalone: true,
  imports: [Dialog, ToggleSwitch, ConfirmDialog, ToastModule, MessageModule, AreaComponent, ProvinceComponent, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './memberAdd.component.html',
})

export class MemberAddComponent {
  @Output() onSaveSuccess = new EventEmitter<void>();
  @ViewChild('memberAddForm') memberAddForm!: NgForm; // Add this line

  visible: boolean = false;
  memberData: any;
  changeAreaCode?: number;
  changeProvinceCode?: number;
  changeCountryCode?: number;

  constructor(private memberService: MemberService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  ngOnInit() {
    if (!this.memberData) {
      this.memberData = this.defaultMemberData();
    }
  }

  add() {
    this.visible = true;
    this.memberData = this.defaultMemberData();

    setTimeout(() => {
      if (this.memberAddForm) {
        this.memberAddForm.resetForm(this.memberData);
      }
    });
  }

  defaultMemberData(): any {
    return {
      id: null,
      fullName: "",
      countryCode: 90,
      isActive: true,
      countryId: undefined,
      areaId: undefined,
      provinceId: undefined,
      identificationNumber: null,
      telephone: undefined,
      email: null,
      dateOfBirth: null
    };
  }

  // Validasyon fonksiyonu
private isFormDataValid(): boolean {
  const requiredFields = {
    provinceId: !!this.memberData.provinceId,
    countryId: !!this.memberData.countryId,
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


    const newMemberValue = {
      fullName: this.memberData.fullName,
      identificationNumber: this.memberData.identificationNumber,
      telephone: this.memberData.telephone,
      countryCode: this.memberData.countryCode,
      email: this.memberData.email,
      dateOfBirth: this.memberData.dateOfBirth,
      countryId: this.memberData.countryId,
      provinceId: this.memberData.provinceId,
      isActive: this.memberData.isActive,
      areaId: (this.memberData.areaId || 8)
    }
    const result = await this.memberService.addMember(newMemberValue);
    if (result) {
      this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Yeni Üye Eklendi' });
      this.onSaveSuccess.emit();
      this.visible = false;

      return;
    } else {
      this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Yeni Üye Eklenirken hata oluştu' });
    }
  }

  async onCancel(form: any) {
    if (!isEquals(this.defaultMemberData(), this.memberData)) {

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
          this.memberData = this.defaultMemberData();
          this.resetForm();
        },
        reject: () => {
          this.messageService.add({ severity: 'error', summary: 'Reddedilmiş', detail: 'Reddettin' });
          // Dialog açık kalacak - this.visible = false; yok
        },
      });
    } else {
      // Eğer form boşsa direkt kapat
      this.visible = false;
      this.resetForm();
    }
    // Bu satırı kaldırdık: this.visible = false;
  }

   private resetForm() {
    setTimeout(() => {
      if (this.memberAddForm) {
        this.memberAddForm.resetForm(this.defaultMemberData());
      }
    });
  }

  onCountrySelected(countryCode: any): void {
    this.memberData.countryId = countryCode;
    this.changeCountryCode = countryCode;
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
