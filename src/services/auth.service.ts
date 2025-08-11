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
  private currentMemberSubject = new BehaviorSubject<any>(null);
  public currentMember$ = this.currentMemberSubject.asObservable();


constructor(private http: HttpClient) {
    // Sayfa yenilendiğinde localStorage'dan user'ı yükle
    this.loadUserFromStorage();
  }

  // Email ile giriş yap
  async loginWithEmail(email: string, password: string): Promise<any| null> {
    try {
      const getMember: any = await firstValueFrom(this.http.get(`${this.envService.apiUrl}/managementMember/login?email=${email}&password=${password}`));
      if (getMember?.errors) {
        throw new Error('Kullanıcı bulunamadı veya şifre yanlış.');
      }
      // User'ı state'e kaydet
      this.setCurrentMember(getMember.data);

      setWithExpiry('currentMember', JSON.stringify(getMember.data), 86400000 * 7); // 7 gün TTL
      return getMember.data;
    } catch (error: any) {
      this.envService.logDebug('Login error', error);
    }
  }

  // user'ı state'e kaydetme
  setCurrentMember(member: any): void {
    this.currentMemberSubject.next(member);
  }

   // Current user'ı alma
  getCurrentMember(): any {
    return this.currentMemberSubject.value;
  }

  getCurrentToken(): string | null {
  return this.currentMemberSubject?.value?.token || null;
}

  // User'ı temizleme (logout)
  logout(): void {
    this.currentMemberSubject.next(null);
    localStorage.removeItem('currentMember');
  }

  // Storage'dan user yükleme
  private loadUserFromStorage(): void {
    const storedMember = getWithExpiry('currentMember') ?? '';
    if (storedMember) {
      try {
        const member = JSON.parse(storedMember);
        this.setCurrentMember(member);
      } catch (error) {
        console.error('Error parsing stored member:', error);
      }
    }
  }

  // user login olmuş mu kontrolü
  isLoggedIn(): boolean {
    return this.getCurrentMember() !== null;
  }
}
