import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        } else {
          // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}

// Alternatif olarak, sadece giriş yapmış kullanıcıları login sayfasından uzak tutmak için
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          return true;
        } else {
          // Kullanıcı zaten giriş yapmışsa home sayfasına yönlendir
          return this.router.createUrlTree(['/home']);
        }
      })
    );
  }
}
