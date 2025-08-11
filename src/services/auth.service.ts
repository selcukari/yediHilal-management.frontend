import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { setWithExpiry, getWithExpiry } from '../app/composables/useLocalStorage';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private envService = inject(EnvironmentService);
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


constructor(private http: HttpClient) {
    // Sayfa yenilendiğinde localStorage'dan user'ı yükle
    this.loadUserFromStorage();
  }

  // Email ile giriş yap
  async loginWithEmail(email: string, password: string): Promise<any| null> {
    try {
      const getUser: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/managementMember/login?email=${email}&password=${password}`));
      if (getUser?.errors) {
        throw new Error('Kullanıcı bulunamadı veya şifre yanlış.');
      }
      // User'ı state'e kaydet
      this.setCurrentUser(getUser.data);

      setWithExpiry('currentUser', JSON.stringify(getUser.data), 86400000 * 7); // 7 gün TTL
      return getUser.data;
    } catch (error: any) {
      this.envService.logDebug('Login error', error);
    }
  }

  // user'ı state'e kaydetme
  setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
  }

   // Current user'ı alma
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getCurrentToken(): string | null {
  return this.currentUserSubject?.value?.token || null;
}

  // User'ı temizleme (logout)
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  // Storage'dan user yükleme
  private loadUserFromStorage(): void {
    const storedUser = getWithExpiry('currentUser') ?? '';
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }

  // user login olmuş mu kontrolü
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}
