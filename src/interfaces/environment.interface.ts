export interface Environment {
  production: boolean;
  apiUrl: string;
  appName: string;
  version: string;
  enableDebug: boolean;
  firebaseConfig: {
    databaseURL: string;
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
