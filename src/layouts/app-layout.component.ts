import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ToastModule, ButtonModule, CommonModule],
  providers: [MessageService],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  isAuthenticated = false;
  currentUser: any = null;

  ngOnInit() {
    // Auth state değişikliklerini dinle
    this.authService.currentMember$.subscribe((user: any) => {
      console.log('Current user:', user);
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });
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
