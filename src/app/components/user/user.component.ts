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
import { DistrictComponent } from '../district/district.component';

@Component({
  selector: 'app-component-user',
  standalone: true,
  imports: [Dialog, DistrictComponent, MessageModule, AreaComponent, ProvinceComponent, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  templateUrl: './user.component.html',
})

export class UserComponent {
  visible: boolean = false;
  userData: any;
  changeAreaCode?: number;
  changeProvinceCode?: number;


  ngOnInit() {
    if (!this.userData) {
      this.userData = this.defaultUserData();
    }
  }
  addOrEdit(newValue: any) {
  this.visible = true;
  this.userData = newValue || this.defaultUserData();
  console.log('New value:', newValue);
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

      this.visible = false;
    }

  }

  async onCancel(form: any) {
    console.log('Form cancelled');
    this.visible = false;
  }

  onCountrySelected(countryCode: any): void {
    console.log('Selected country code:', countryCode);
    this.userData.countryId = countryCode;
  }

  onProvinceSelected(provinceCode: any): void {
    console.log('Selected provinceCode code:', provinceCode);
    this.userData.provinceId = provinceCode;
    this.changeProvinceCode = provinceCode;
  }
  onAreaSelected(areaCode: any): void {
    console.log('Selected area code:', areaCode);
    this.userData.areaId = areaCode;

    this.userData.provinceId = undefined;
    this.changeAreaCode = areaCode;
  }

   onDistrictSelected(districtCode: any): void {
    console.log('Selected districtCode code:', districtCode);
    this.userData.districtId = districtCode;
  }
}
