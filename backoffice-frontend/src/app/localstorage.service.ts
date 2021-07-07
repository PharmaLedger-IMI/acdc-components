import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  static readonly ACDC_USER: string = 'acdc_user';
  static readonly EVENT_PAGE: string = 'table_handler';
  private readonly localStorage: Storage;

  constructor() {
    this.localStorage = localStorage;
  }

  set(key: string, value: any): void {
    this.localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string): any {
    return JSON.parse(this.localStorage.getItem(key) || '{}');
  }

  remove(key: string): void {
    this.localStorage.removeItem(key);
  }

  clear(): void {
    this.localStorage.clear();
  }
}
