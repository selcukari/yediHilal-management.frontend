import { Component, OnInit } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { InputIconModule } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { CountryComponent } from '../../components/country/country.component';
import { ProvinceComponent } from '../province/province.component';
import { AreaComponent } from '../area/area.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { DistrictComponent } from '../district/district.component';

@Component({
  selector: 'app-component-user',
  standalone: true,
  imports: [Dialog, DistrictComponent, ToggleSwitch, MessageModule, AreaComponent, ProvinceComponent, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  templateUrl: './user.component.html',
})

export class UserComponent {
  visible: boolean = false;
  userData: any;
  changeAreaCode?: number;
  changeProvinceCode?: number;
  firstDistrctId?: number;


  ngOnInit() {
    if (!this.userData) {
      this.userData = this.defaultUserData();
    }
  }
  addOrEdit(newValue: any) {
  this.visible = true;
  this.userData = newValue || this.defaultUserData();
  this.firstDistrctId = this.userData.districtId;
  }

  defaultUserData(): any {
    return {
      id: null,
      fullName: "",
      isActive: true,
      countryId: null,
      areaId: null,
      provinceId: null,
      districtId: null,
      identificationNumber: null,
      telephone: null,
      email: null,
      dateOfBirth: null
    };
  }

   async onSave(form: any) {
    console.log('Form submitted with value:', this.userData);
    console.log('Form validity:', form.valid);
    if (form.valid) {

      // district undefiald ise ilk deger ata
      this.userData.districtId = this.firstDistrctId;

      this.visible = false;
    }

  }

  async onCancel(form: any) {
    this.visible = false;
  }

  onCountrySelected(countryCode: any): void {
    this.userData.countryId = countryCode;
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

   onDistrictSelected(districtCode: any): void {
    this.userData.districtId = districtCode;
  }
}
