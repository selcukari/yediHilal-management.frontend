import { Component, EventEmitter, Output } from '@angular/core';
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
import { MemberService } from '../../../services/member.service';
import { isEquals } from '../../helpers';

@Component({
  selector: 'app-component-memberEdit',
  standalone: true,
  imports: [Dialog, ToggleSwitch, ConfirmDialog, ToastModule, MessageModule, AreaComponent, ProvinceComponent, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './memberEdit.component.html',
  styleUrl: './memberEdit.component.scss'
})

export class MemberEditComponent {
  @Output() onSaveSuccess = new EventEmitter<void>();

  visible: boolean = false;
  memberData: any;
  changeAreaCode?: number;
  changeProvinceCode?: number;
  lazyValue: any = null;
  defaultMemberData = {
    id: null,
    fullName: "",
    isActive: true,
    countryCode: undefined,
    countryId: undefined,
    areaId: undefined,
    provinceId: undefined,
    isSms: true,
    isMail: true,
    identificationNumber: undefined,
    telephone: undefined,
    email: undefined,
    dateOfBirth: undefined
  };

  constructor(private memberService: MemberService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  ngOnInit() {
    if (!this.memberData) {
      this.memberData = this.defaultMemberData;
    }
  }

  async edit(newValue: any) {
    this.visible = true;
    this.memberData = newValue || this.defaultMemberData;
    this.changeAreaCode = this.memberData.areaId;

    this.lazyValue = clone(newValue);

    await new Promise(resolve => setTimeout(resolve, 100));
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
      fullName: this.memberData.fullName.trim(),
      identificationNumber: this.memberData.identificationNumber?.trim(),
      telephone: this.memberData.telephone.trim(),
      email: this.memberData.email?.trim(),
      dateOfBirth: this.memberData.dateOfBirth,
      countryId: this.memberData.countryId,
      areaId: this.memberData.areaId,
      provinceId: this.memberData.provinceId,
      countryCode: this.memberData.countryCode.toString().trim(),
      isActive: this.memberData.isActive,
      isMail: this.memberData.isMail,
      isSms: this.memberData.isSms,
      createdDate: this.memberData.createdDate,
      ...(this.memberData.id ? {updateDate: new Date().toISOString() } : {})
    }

    const result = await this.memberService.updateMember(updateMemberValue);
    if (result === true) {
      this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Kullanıcı Güncellendi' });
      this.onSaveSuccess.emit();
      this.visible = false;

      return;
    }
    if (result?.data === false && result?.errors) {
      this.messageService.add({ severity: 'warn', summary: 'Uyarı', detail: result.errors[0] });

    } else {
      this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Kullanıcı Güncellenemedi' });
    }
  }

  async onCancel(form: any) {
    if (!isEquals(this.lazyValue, this.memberData)) {

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
          this.memberData = this.defaultMemberData;
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
    this.memberData.provinceId = provinceCode;
    this.changeProvinceCode = provinceCode;
  }
  onAreaSelected(areaCode: any): void {
    this.memberData.areaId = areaCode;

    this.memberData.provinceId = undefined;
    this.changeAreaCode = areaCode;
  }
}
