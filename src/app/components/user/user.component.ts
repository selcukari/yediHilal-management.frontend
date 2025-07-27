import { Component, OnInit } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';


@Component({
  selector: 'app-component-user',
  standalone: true,
  imports: [Dialog, ButtonModule, InputTextModule, AvatarModule],
  templateUrl: './user.component.html',
})

export class UserComponent {
  visible: boolean = false;
  userData: any;

  addOrEdit(newValue: any) {
  this.visible = true;
  this.userData = newValue || {};
  console.log('New value:', newValue);
  }
}
