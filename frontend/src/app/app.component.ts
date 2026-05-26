import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>
    <div class="toast-container">
      <div *ngFor="let t of (toast.toasts$ | async)"
           class="toast"
           [class.success]="t.type==='success'"
           [class.error]="t.type==='error'"
           [class.warning]="t.type==='warning'">
        <span class="toast-icon">{{ t.type==='success' ? '\u2705' : t.type==='error' ? '\u274C' : '\u26A0\uFE0F' }}</span>
        <span>{{ t.msg }}</span>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(public toast: ToastService) {}
  ngOnInit() {
    const dark = localStorage.getItem('medinova_dark') === '1';
    document.body.classList.toggle('dark-mode', dark);
  }
}
