import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  // Environment değerlerini getter metodları ile expose ediyoruz
  get isProduction(): boolean {
    return environment.production;
  }

  get appName(): string {
    return environment.appName;
  }

  get version(): string {
    return environment.version;
  }

  get enableDebug(): boolean {
    return environment.enableDebug;
  }

  get firebaseConfig(): any {
    return environment.firebaseConfig;
  }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  logDebug(message: string, data?: any): void {
    if (environment.enableDebug) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
}
