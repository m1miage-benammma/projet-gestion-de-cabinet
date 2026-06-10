import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>
    <div class="toast-container">
      <div *ngFor="let t of toast.toasts"
           class="toast"
           [class.success]="t.type==='success'"
           [class.error]="t.type==='error'"
           [class.warning]="t.type==='warning'">
        <span class="toast-icon">{{ t.type==='success' ? '✅' : t.type==='error' ? '❌' : '⚠️' }}</span>
        <span>{{ t.message }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService, public toast: ToastService) {}

  ngOnInit() {
    // Dark mode
    const dark = localStorage.getItem('medinova_dark') === '1';
    document.body.classList.toggle('dark-mode', dark);

    // QR code ordonnance
    const params = new URLSearchParams(window.location.search);
    const ordId = params.get('ordonnance');
    if (ordId && !isNaN(+ordId)) {
      this.auth.navigate('/ordonnance?ordonnance=' + ordId);
      return;
    }

    // Rediriger si déjà connecté
    if (this.auth.isLoggedIn()) {
      this.auth.redirectToDashboard();
    }
  }
}