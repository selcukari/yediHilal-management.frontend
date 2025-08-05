import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.component';
import { AppLayoutComponent } from '../layouts/app-layout.component';
import { HomePageComponent } from './pages/home/home.component';
import { MemberPageComponent } from './pages/member/member.component';
import { MailListPageComponent } from './pages/mailList/mailList.component';
import { AuthGuard, NoAuthGuard } from '../services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '', component: HomePageComponent, canActivate: [AuthGuard]
      }, // Ana sayfa yönlendirmesi
      {
        path: 'login',
        component: LoginPageComponent,
        canActivate: [NoAuthGuard] // Giriş yapmış kullanıcılar login sayfasına giremez
      },
      {
        path: 'members', component: MemberPageComponent, canActivate: [AuthGuard]
      },
      {
        path: 'mailList/:type', component: MailListPageComponent, canActivate: [AuthGuard]
      },
    ]
  },
  { path: '**', redirectTo: '/' } // Geçersiz rotalar için yönlendirme
];
