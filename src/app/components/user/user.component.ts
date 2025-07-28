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


@Component({
  selector: 'app-component-user',
  standalone: true,
  imports: [Dialog, MessageModule, CountryComponent, ButtonModule, FormsModule, FloatLabel, IconFieldModule, InputIconModule, InputTextModule, AvatarModule],
  templateUrl: './user.component.html',
})

export class UserComponent {
  visible: boolean = false;
  userData: any;


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

   async onSubmit(form: any) {
    console.log('Form submitted with value:', this.userData);
    console.log('Form validity:', form.valid);
    if (form.valid) {
    }
  }

  onCountrySelected(countryCode: any): void {
    console.log('Selected country code:', countryCode);
    this.userData.countryId = countryCode;
  }
}
