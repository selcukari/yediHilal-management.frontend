import { Injectable, inject } from '@angular/core';
import axios from 'axios';
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

  // Component'te
// currentMember$ = this.authService.currentMember$;


constructor() {
    // Sayfa yenilendiğinde localStorage'dan user'ı yükle
    this.loadUserFromStorage();
  }

  // Email ile giriş yap
  async loginWithEmail(email: string, password: string): Promise<any| null> {
    try {
      const getMember = await axios.get(`${this.envService.apiUrl}/login?email=${email}&password=${password}`);
      if (!getMember.data.data) {
        throw new Error('Kullanıcı bulunamadı veya şifre yanlış.');
      }
      // User'ı state'e kaydet
      this.setCurrentMember(getMember.data.data);

      setWithExpiry('currentMember', JSON.stringify(getMember.data.data), 3600000 * 3);
      return getMember.data.data;
    } catch (error: any) {
      this.envService.logDebug('Login error', error);
    }
  }

  // member'ı state'e kaydetme
  setCurrentMember(member: any): void {
    this.currentMemberSubject.next(member);
  }

   // Current user'ı alma
  getCurrentMember(): any {
    return this.currentMemberSubject.value;
  }

  // User'ı temizleme (logout)
  logout(): void {
    this.currentMemberSubject.next(null);
    localStorage.removeItem('currentMember');
  }

  // Storage'dan member yükleme
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

  // member login olmuş mu kontrolü
  isLoggedIn(): boolean {
    return this.getCurrentMember() !== null;
  }
}
