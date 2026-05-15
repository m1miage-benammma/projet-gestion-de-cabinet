import { Injectable } from '@angular/core';

export interface Toast {
  id:      number;
  message: string;
  type:    'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];
  private nextId = 0;

  success(message: string, duration = 4000) { this.add(message, 'success', duration); }
  error(message: string,   duration = 5000) { this.add(message, 'error',   duration); }
  info(message: string,    duration = 4000) { this.add(message, 'info',    duration); }

  private add(message: string, type: Toast['type'], duration: number) {
    const id = ++this.nextId;
    this.toasts.push({ id, message, type });
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}