import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { Listbox } from 'primeng/listbox';


interface City {
    name: string,
    code: string
}

@Component({
  selector: 'app-pages-members',
  standalone: true,
  imports: [ToastModule, FormsModule, Listbox],
  providers: [MessageService],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberPageComponent implements OnInit {
  private router = inject(Router);

    pages!: City[];

  async ngOnInit() {

    this.pages = [
      { name: 'Kullanıcı Yönetimi', code: '/' },
            { name: 'Üye Yönetimi', code: 'members' },
            { name: 'Sayfa-3', code: 'LDN' },
        ];
  }

   onPageSelect(city: any): void {
    console.log('Selected city:', city);
    this.router.navigate([`/${city.code}`]);
  }
}
