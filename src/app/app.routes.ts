import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.component';
import { AppLayoutComponent } from '../layouts/app-layout.component';
import { MemberPageComponent } from './pages/member/member.component';
import { UserPageComponent } from './pages/user/user.component';
import { MessageListPageComponent } from './pages/messageList/messageList.component';
import { MailListPageComponent } from './pages/mailList/mailList.component';
import { AuthGuard, NoAuthGuard } from '../services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '', component: MemberPageComponent, canActivate: [AuthGuard]
      }, // Ana sayfa yönlendirmesi
      {
        path: 'login',
        component: LoginPageComponent,
        canActivate: [NoAuthGuard] // Giriş yapmış kullanıcılar login sayfasına giremez
      },
      {
        path: 'users', component: UserPageComponent, canActivate: [AuthGuard]
      },
      {
        path: 'mailList/:type', component: MailListPageComponent, canActivate: [AuthGuard]
      },
      {
        path: 'messageList/:type', component: MessageListPageComponent, canActivate: [AuthGuard]
      },
    ]
  },
  { path: '**', redirectTo: '/' } // Geçersiz rotalar için yönlendirme
];
