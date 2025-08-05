import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { Listbox } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface PageType {
    name: string,
    code: string
}

@Component({
   selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule, ToastModule, Listbox, ButtonModule, CommonModule],
  providers: [MessageService],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  pages!: PageType[];
  isAuthenticated = false;
  currentUser: any = null;

  ngOnInit() {
    // Auth state değişikliklerini dinle
    this.authService.currentMember$.subscribe((user: any) => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });

    this.pages = [
      { name: 'Kullanıcı Yönetimi', code: '/' },
      { name: 'Üye Yönetimi', code: 'members' },
      { name: 'Gön. Kul. E-Mail Listesi', code: 'mailList/2' },
      { name: 'Gön. Üye E-Mail Listesi', code: 'mailList/1' },
      { name: 'Gön. Kul. Bildirim Listesi', code: 'LDN' },
      { name: 'Gön. Üye Bildirim Listesi', code: 'LDN' },
    ];
  }

    onPageSelect(route: any): void {

    if(route && route.code) {
      this.router.navigate([`/${route.code}`]);
    }

  }

  async onLogout() {
    try {
      await this.authService.logout();
      this.messageService.add({
        severity: 'success',
        summary: 'Başarılı',
        detail: 'Çıkış işlemi tamamlandı',
        life: 3000
      });

      // Login sayfasına yönlendir
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Çıkış işlemi başarısız',
        life: 3000
      });
    }
  }
}
