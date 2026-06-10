import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { ApiService } from "../../core/services/api.service";
import { ToastService } from "../../core/services/toast.service";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../shared/header/header.component";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: "./admin.component.html"
})
export class AdminComponent implements OnInit, OnDestroy {

  TABS = [
    { id: "dashboard",    label: "Tableau de bord",   icon: "bar-chart-2" },
    { id: "utilisateurs", label: "Utilisateurs",      icon: "users" },
    
    { id: "rappels",      label: "Rappels RDV",       icon: "bell" },
    { id: "messages",     label: "Messages contact",  icon: "mail" },
  ];

  activeTab = "dashboard";
  sidebarOpen = false;
  loading: any = {};
  successMsg = "";
  errorMsg = "";

  rapport: any = null;
  animatedStats: any = { rdv: 0, patients: 0, medecins: 0, consultations: 0 };

  utilisateurs: any[] = [];
  utilisateursFiltres_: any[] = [];
  filterSearch = "";
  filterRole = "";
  createNom = ""; createPrenom = ""; createEmail = "";
  createPassword = ""; createRole = "patient";
  createError = ""; createSuccess = "";

  stock: any[] = [];
  stockForm = { nom: "", quantite: 0, unite: "comprimés", seuil_alerte: 10, prix_unitaire: 0 };
  stockSuccess = false;

  rappels: any[] = [];
  rappelsEnvoyes = 0;

  messagesContact: any[] = [];
  factures: any[] = [];

  currentTime = "";
  currentYear = new Date().getFullYear();
  private clockInterval: any;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public toast: ToastService
  ) {}

  ngOnInit() {
    const vars: any = {
      "--primary": "#1B4F8A", "--primary-dark": "#163d6e",
      "--primary-mid": "#b91c1c", "--primary-light": "#FEE2E2",
      "--primary-border": "#FCA5A5", "--accent": "#f87171"
    };
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v as string));
    this.chargerRapport();
    this.chargerUtilisateurs();
    this.chargerStock();
    this.api.getAdminFactures().subscribe({ next: (f: any[]) => this.factures = f || [], error: () => {} });
    this.updateTime();
    this.clockInterval = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.successMsg = "";
    this.errorMsg = "";
    if (tab === "utilisateurs") this.chargerUtilisateurs();
    if (tab === "dashboard")    this.chargerRapport();
    if (tab === "messages")     this.chargerMessagesContact();
    if (tab === "stock")        this.chargerStock();
    if (tab === "rappels")      this.chargerRappels();
  }

  chargerRapport() {
    this.api.getRapport().subscribe({
      next: (r: any) => { this.rapport = r; this.animateStats(r); },
      error: () => {}
    });
  }

  animateStats(r: any) {
    const targets = {
      rdv: r?.total_rdv || 0,
      patients: r?.total_patients || 0,
      medecins: r?.total_medecins || 0,
      consultations: r?.total_consultations || 0
    };
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      this.animatedStats.rdv = Math.round(targets.rdv * ease);
      this.animatedStats.patients = Math.round(targets.patients * ease);
      this.animatedStats.medecins = Math.round(targets.medecins * ease);
      this.animatedStats.consultations = Math.round(targets.consultations * ease);
      if (step >= steps) clearInterval(timer);
    }, 25);
  }

  chargerUtilisateurs() {
    this.loading["users"] = true;
    this.api.getUtilisateurs().subscribe({
      next: (u: any[]) => { this.utilisateurs = u; this.loading["users"] = false; },
      error: () => this.loading["users"] = false
    });
  }

  utilisateursFiltres(): any[] {
    return this.utilisateurs.filter(u => {
      const q = this.filterSearch.toLowerCase();
      const matchSearch = !q || u.nom?.toLowerCase().includes(q) || u.prenom?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchRole = !this.filterRole || u.role === this.filterRole;
      return matchSearch && matchRole;
    });
  }

  creerCompte() {
    if (!this.createNom || !this.createPrenom || !this.createEmail || !this.createPassword) {
      this.createError = "Tous les champs sont obligatoires."; return;
    }
    this.createError = "";
    this.api.creerUtilisateur({
      nom: this.createNom, prenom: this.createPrenom,
      email: this.createEmail, password: this.createPassword, role: this.createRole
    }).subscribe({
      next: () => {
        this.createSuccess = "Compte créé !";
        this.createNom = ""; this.createPrenom = ""; this.createEmail = "";
        this.createPassword = ""; this.createRole = "patient";
        this.chargerUtilisateurs();
        setTimeout(() => this.createSuccess = "", 3000);
      },
      error: (e: any) => this.createError = e.error?.message || "Erreur création."
    });
  }

  activerCompte(u: any) {
    this.api.activerUtilisateur(u.id_utilisateur).subscribe({
      next: () => { u.actif = true; this.toast.success("Compte activé !"); },
      error: () => {}
    });
  }

  desactiverCompte(u: any) {
    this.api.desactiverUtilisateur(u.id_utilisateur).subscribe({
      next: () => { u.actif = false; this.toast.success("Compte désactivé."); },
      error: () => {}
    });
  }

  formatRole(role: string): string {
    const map: any = { medecin: 'Médecin', infirmiere: 'Infirmière', patient: 'Patient', admin: 'Admin' };
    return map[role] || role;
  }

  roleColor(role: string): { bg: string; text: string } {
    const map: any = {
      medecin:    { bg: '#EBF4FD', text: '#1B4F8A' },
      infirmiere: { bg: '#FFF8E6', text: '#875C00' },
      patient:    { bg: '#E8F5F1', text: '#0A6E4A' },
      admin:      { bg: '#F2ECF9', text: '#5B2C8D' },
    };
    return map[role] || { bg: '#F5F7FA', text: '#4A5568' };
  }

  supprimerCompte(id: number) {
    if (!confirm("Supprimer ce compte ?")) return;
    this.api.supprimerUtilisateur(id).subscribe({
      next: () => { this.utilisateurs = this.utilisateurs.filter(x => x.id_utilisateur !== id); },
      error: (e: any) => { alert('Erreur suppression: ' + (e.error?.message || e.status)); }
    });
  }

  // ── STOCK ──────────────────────────────────────────────────────
  getStockFaibleCount(): number {
    return this.stock.filter((s: any) => s.quantite <= s.seuil_alerte).length;
  }

  chargerStock() {
    this.api.getStock().subscribe({ next: (s: any[]) => this.stock = s || [], error: () => {} });
  }

  ajouterMedicament() {
    if (!this.stockForm.nom || this.stockForm.quantite <= 0) {
      this.toast.error("Nom et quantité obligatoires !"); return;
    }
    this.api.ajouterStock(this.stockForm).subscribe({
      next: () => {
        this.stockSuccess = true;
        this.chargerStock();
        this.stockForm = { nom: "", quantite: 0, unite: "comprimés", seuil_alerte: 10, prix_unitaire: 0 };
        setTimeout(() => this.stockSuccess = false, 3000);
        this.toast.success("✅ Stock mis à jour !");
      }, error: () => this.toast.error("Erreur ajout stock.")
    });
  }

  modifierQuantite(s: any, delta: number) {
    const newQty = Math.max(0, s.quantite + delta);
    this.api.modifierStock(s.id, newQty).subscribe({
      next: () => { s.quantite = newQty; }, error: () => {}
    });
  }

  supprimerMedicament(s: any) {
    if (!confirm("Supprimer " + s.nom + " ?")) return;
    this.api.supprimerStock(s.id).subscribe({
      next: () => { this.stock = this.stock.filter((x: any) => x.id !== s.id); this.toast.success("Supprimé !"); },
      error: () => {}
    });
  }

  getStockStatus(s: any): string {
    if (s.quantite <= 0) return "épuisé";
    if (s.quantite <= s.seuil_alerte) return "faible";
    return "ok";
  }

  imprimerStock() {
    const rows = this.stock.map((s: any) => `
      <tr>
        <td style="padding:10px 16px;font-weight:600">${s.nom}</td>
        <td style="padding:10px 16px;text-align:center;font-size:18px;font-weight:900;color:${s.quantite<=0?"#e74c3c":s.quantite<=s.seuil_alerte?"#f59e0b":"#166534"}">${s.quantite}</td>
        <td style="padding:10px 16px">${s.unite}</td>
        <td style="padding:10px 16px">${s.seuil_alerte}</td>
        <td style="padding:10px 16px">${s.prix_unitaire ? s.prix_unitaire + " DA" : "—"}</td>
        <td style="padding:10px 16px">${s.quantite<=0?"❌ Épuisé":s.quantite<=s.seuil_alerte?"⚠️ Faible":"✅ OK"}</td>
      </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Inventaire</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Segoe UI",sans-serif;padding:32px}
    .logo{font-size:24px;font-weight:900;color:#0A3D62}.logo span{color:#00C9A7}
    table{width:100%;border-collapse:collapse;margin-top:24px}
    th{background:#0A3D62;color:white;padding:10px 16px;text-align:left;font-size:12px;text-transform:uppercase}
    tr:nth-child(even){background:#f8fafc}</style></head><body>
    <div style="display:flex;justify-content:space-between;border-bottom:3px solid #0A3D62;padding-bottom:16px;margin-bottom:8px">
      <div><div class="logo">Medi<span>Nova</span></div></div>
      <div style="text-align:right"><b style="font-size:20px;color:#0A3D62">INVENTAIRE MÉDICAMENTS</b><br>
      <span style="font-size:12px;color:#999">${new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}</span></div>
    </div>
    <table><thead><tr><th>Médicament</th><th>Qté</th><th>Unité</th><th>Seuil</th><th>Prix</th><th>Statut</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div style="margin-top:20px;font-size:12px;color:#999">Total: ${this.stock.length} — Alertes: ${this.getStockFaibleCount()}</div>
    <script>setTimeout(()=>window.print(),500);</script></body></html>`;
    const w = window.open("", "_blank"); w?.document.write(html); w?.document.close();
  }

  // ── RAPPELS ────────────────────────────────────────────────────
  chargerRappels() {
    this.api.getRappelsRdv().subscribe({
      next: (r: any) => { this.rappels = r?.rdvs || []; this.rappelsEnvoyes = r?.rdvs?.length || 0; },
      error: () => {}
    });
  }

  envoyerRappels() {
    this.api.envoyerRappels().subscribe({
      next: (r: any) => {
        this.rappelsEnvoyes = r?.rdvs?.length || 0;
        this.toast.success("✅ " + this.rappelsEnvoyes + " rappel(s) envoyé(s) !");
        this.chargerRappels();
      }, error: () => this.toast.error("Erreur envoi rappels.")
    });
  }

  // ── MESSAGES CONTACT ──────────────────────────────────────────
  chargerMessagesContact() {
    this.api.getMessagesContact().subscribe({
      next: (m: any[]) => this.messagesContact = m,
      error: () => {}
    });
  }

  marquerContactLu(msg: any) {
    this.api.marquerContactLu(msg.id).subscribe({
      next: () => { msg.lu = true; }, error: () => {}
    });
  }

  // ── FACTURATION ───────────────────────────────────────────────
  getTotalFactures(): number { return this.factures.filter(f => !f.statut?.includes("impay")).reduce((s, f) => s + Number(f.montant), 0); }
  getTodayRevenue(): number {
    const today = new Date().toISOString().split("T")[0];
    return this.factures.filter(f => !f.statut?.includes("impay") && f.created_at?.startsWith(today)).reduce((s, f) => s + Number(f.montant), 0);
  }
  getTodayPending(): number { return this.factures.filter(f => !!f.statut?.includes("impay")).length; }

  // ── GRAPHIQUES ────────────────────────────────────────────────
  getMoisStats(): any[] {
    const mois = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
    const currentMonth = new Date().getMonth();
    const rdvParMois: number[] = this.rapport?.rdv_par_mois || [];
    const max = Math.max(...rdvParMois, 1);
    return mois.map((label, i) => {
      const val = rdvParMois[i] || 0;
      return { label, val, h: Math.min(100, Math.round((val / max) * 100)), actif: i <= currentMonth };
    });
  }

  getBarWidth(val: number, total: number): string {
    if (!total) return "0%";
    return Math.round((val / total) * 100) + "%";
  }

  getDonutDash(val: number, total: number): number {
    if (!total) return 0;
    return Math.round((val / total) * 314);
  }

  getStatutColor(statut: string): string {
    const s = (statut || "").toLowerCase();
    if (s.includes("attente")) return "#f39c12";
    if (s.includes("confirm") || s.includes("arrive")) return "#27ae60";
    if (s.includes("termin")) return "#0A3D62";
    if (s.includes("annul")) return "#e74c3c";
    return "#6c757d";
  }
}