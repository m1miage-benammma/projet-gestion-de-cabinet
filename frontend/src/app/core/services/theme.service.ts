import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  themes = [
    { id: 'blue',   name: 'Bleu',    primary: '#0A3D62', accent: '#00C9A7' },
    { id: 'green',  name: 'Vert',    primary: '#166534', accent: '#22c55e' },
    { id: 'purple', name: 'Violet',  primary: '#6D28D9', accent: '#a78bfa' },
    { id: 'red',    name: 'Rouge',   primary: '#991B1B', accent: '#f87171' },
    { id: 'orange', name: 'Orange',  primary: '#92400E', accent: '#f59e0b' },
    { id: 'teal',   name: 'Turquoise', primary: '#0f766e', accent: '#2dd4bf' },
  ];

  currentTheme = 'blue';

  constructor() {
    const saved = localStorage.getItem('medinova_theme') || 'blue';
    this.applyTheme(saved);
  }

  applyTheme(id: string) {
    const theme = this.themes.find(t => t.id === id) || this.themes[0];
    this.currentTheme = id;
    localStorage.setItem('medinova_theme', id);
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--primary-mid', theme.primary + 'dd');
    document.documentElement.style.setProperty('--primary-light', theme.primary + '15');
    document.documentElement.style.setProperty('--primary-border', theme.primary + '44');
    document.documentElement.style.setProperty('--accent', theme.accent);
  }

  getPatientBg(): string {
    const theme = this.themes.find(t => t.id === this.currentTheme) || this.themes[0];
    return `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primary}cc 100%)`;
  }
}