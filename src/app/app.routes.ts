import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AppLayoutComponent } from '../layouts/app-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { MemberComponent } from './pages/member/member.component';
import { AuthGuard, NoAuthGuard } from '../services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '', component: HomeComponent, canActivate: [AuthGuard]
      }, // Ana sayfa yönlendirmesi
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [NoAuthGuard] // Giriş yapmış kullanıcılar login sayfasına giremez
      },
       {
        path: 'members', component: MemberComponent, canActivate: [AuthGuard]
      },
    ]
  },
  { path: '**', redirectTo: '/' } // Geçersiz rotalar için yönlendirme
];
