import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { Listbox } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Image } from 'primeng/image';
import { InputIconModule } from 'primeng/inputicon';

interface PageType {
  name: string;
  code: string;
  icon: string;
}
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, InputIconModule, Image, FormsModule, ToastModule, Listbox, ButtonModule, CommonModule],
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
    this.authService.currentUser$.subscribe((user: any) => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });

    this.pages = [
      { name: 'Kullanıcı Yönetimi', code: 'users', icon: 'pi-user-edit' },
      { name: 'Üye Yönetimi', code: '/', icon: 'pi-user' },
      // { name: 'Gön. Kul. E-Mail Lis.', code: 'mailList/1', icon: 'pi-send' }, // Kullanıcı gonderilen
      { name: 'Gön. Mail Lis.', code: 'mailList/2', icon: 'pi-send' }, // Üyelere gonderilen
      // { name: 'Gön. Kul. Mesaj Lis.', code: 'smsList/1', icon: 'pi-bell' }, // Kullanıcı gonderilen
      { name: 'Gön. Sms Lis.', code: 'smsList/2', icon: 'pi-bell' }, // Üyelere gonderilen
    ];
  }

  get isOnlyJunior(): boolean {
    return this.authService.getCurrentUser()?.roleId == 3; // 3 is Junior role
  }

  onPageSelect(route: any): void {

    if (this.isOnlyJunior && route?.code === 'users') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Yetkisiz işlem',
        life: 3000
      });

      return;
    }

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
