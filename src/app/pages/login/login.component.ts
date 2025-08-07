import { Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-pages-login',
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule, ToastModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginPageComponent {
  messageService = inject(MessageService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;

  user = {
    email: 'yedihilaladmin@gmail.com',
    password: '123456',
  };

  async onSubmit(form: any) {
    if (form.valid) {
     try {
        const member = await this.authService.loginWithEmail(this.user.email, this.user.password);

        if (member) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: `Hoş geldiniz ${member.fullName}!`,
            life: 3000
          });

          // Form'u temizle
          form.resetForm();
          await new Promise(resolve => setTimeout(resolve, 2000));

          this.router.navigate(['/home']);
        }

        this.messageService.add({
          severity: 'warn',
          summary: 'Uyarı',
          detail: 'Giriş Bilgileriniz Yanlış!',
          life: 3000
        });

      } catch (error: any) {
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: error,
          life: 3000
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
}
