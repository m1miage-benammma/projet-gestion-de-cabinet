import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, API } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  private get h() { return { headers: this.auth.headers() }; }

  // ── Médecins & Disponibilités ──────────────────────────────────────────────
  getMedecins(): Observable<any[]>               { return this.http.get<any[]>(`${API}/medecins`); }
  uploadPhoto(photo: string): Observable<any>    { return this.http.post(`${API}/profil/photo`, { photo }, this.h); }
  envoyerContact(data: any): Observable<any>     { return this.http.post(`${API}/contact`, data); }
  getFactures(): Observable<any[]>               { return this.http.get<any[]>(`${API}/factures`, this.h); }
  creerFacture(data: any): Observable<any>       { return this.http.post(`${API}/factures`, data, this.h); }
  marquerFacturePayee(id: number): Observable<any> { return this.http.patch(`${API}/factures/${id}/payer`, {}, this.h); }
  getStock(): Observable<any[]>                  { return this.http.get<any[]>(`${API}/admin/stock`, this.h); }
  ajouterStock(data: any): Observable<any>       { return this.http.post(`${API}/admin/stock`, data, this.h); }
  modifierStock(id: number, q: number): Observable<any> { return this.http.patch(`${API}/admin/stock/${id}`, { quantite: q }, this.h); }
  supprimerStock(id: number): Observable<any>    { return this.http.delete(`${API}/admin/stock/${id}`, this.h); }
  getRappelsRdv(): Observable<any>               { return this.http.get<any>(`${API}/rappels-rdv`, this.h); }
  envoyerRappels(): Observable<any>              { return this.http.get<any>(`${API}/rappels-rdv`, this.h); }
  getMessagesContact(): Observable<any[]>        { return this.http.get<any[]>(`${API}/admin/messages-contact`, this.h); }
  marquerContactLu(id: number): Observable<any> { return this.http.patch(`${API}/admin/messages-contact/${id}/lu`, {}, this.h); }
  getChatMessages(u1: number, u2: number): Observable<any[]> { return this.http.get<any[]>(`${API}/chat/${u1}/${u2}`, this.h); }
  envoyerChatMessage(exp: number, dest: number, contenu: string): Observable<any> { return this.http.post(`${API}/chat`, { id_expediteur: exp, id_destinataire: dest, contenu }, this.h); }
  getMedecin(id: number): Observable<any>        { return this.http.get<any>(`${API}/medecins/${id}`); }
  /** Disponibilités publiques d'un médecin */
  getDispos(id: number): Observable<any[]>       { return this.http.get<any[]>(`${API}/disponibilites/medecin/${id}`, this.h); }
  /** Disponibilités (avec auth) */
  ajouterDispo(data: any): Observable<any>       { return this.http.post<any>(`${API}/disponibilites`, data, this.h); }
  supprimerDispo(id: number): Observable<any>    { return this.http.delete(`${API}/disponibilites/${id}`, this.h); }

  // ── Rendez-vous ───────────────────────────────────────────────────────────
  prendreRdv(data: any): Observable<any>         { return this.http.post<any>(`${API}/prise-rdv`, data, this.h); }
  /** RDV du patient connecté */
  getRdvPatient(id: number): Observable<any[]>   { return this.http.get<any[]>(`${API}/mes-rendez-vous`, this.h); }
  /** Planning du médecin */
  getPlanning(id: number): Observable<any[]>     { return this.http.get<any[]>(`${API}/rendez-vous/medecin/${id}`, this.h); }
  /** RDV du jour (infirmière) */
  getRdvJour(): Observable<any[]>                { return this.http.get<any[]>(`${API}/rendez-vous-jour`, this.h); }
  confirmerRdv(id: number): Observable<any>      { return this.http.patch(`${API}/rendez-vous/${id}/confirmer`, {}, this.h); }
  annulerRdv(id: number): Observable<any>        { return this.http.patch(`${API}/rendez-vous/${id}/annuler`, {}, this.h); }
  patientArrive(id: number): Observable<any>     { return this.http.patch(`${API}/rendez-vous/${id}/patient-arrive`, {}, this.h); }
  terminerRdv(id: number): Observable<any>       { return this.http.patch(`${API}/rendez-vous/${id}/terminer`, {}, this.h); }
  modifierRdv(id: number, data: any): Observable<any> { return this.http.patch(`${API}/rendez-vous/${id}/modifier`, data, this.h); }

  // ── Dossier médical ──────────────────────────────────────────────────────
  /** Dossier complet du patient connecté */
  getDossierComplet(id: number): Observable<any> { return this.http.get<any>(`${API}/dossier-complet`, this.h); }
  /** Dossier d'un patient (par médecin, via id_utilisateur) */
  dossierUtilisateur(idUtilisateur: number): Observable<any> { return this.http.get<any>(`${API}/dossier-patient/${idUtilisateur}`, this.h); }
  ordonnancePublique(id: number): Observable<any> { return this.http.get<any>(`${API}/ordonnance-publique/${id}`); }

  // ── Consultations ─────────────────────────────────────────────────────────
  consultation(data: any): Observable<any>       { return this.http.post<any>(`${API}/consultations`, data, this.h); }
  consultationsByDossier(idDossier: number): Observable<any> { return this.http.get<any>(`${API}/consultations/dossier/${idDossier}`, this.h); }

  // ── Ordonnances ───────────────────────────────────────────────────────────
  ordonnance(data: any): Observable<any>         { return this.http.post<any>(`${API}/ordonnances`, data, this.h); }
  getOrdonnances(idUtilisateur: number): Observable<any[]> { return this.http.get<any[]>(`${API}/ordonnances/utilisateur/${idUtilisateur}`, this.h); }

  // ── Médicaments ───────────────────────────────────────────────────────────
  medicament(data: any): Observable<any>         { return this.http.post<any>(`${API}/medicaments`, data, this.h); }

  // ── Soins ─────────────────────────────────────────────────────────────────
  soin(data: any): Observable<any>               { return this.http.post<any>(`${API}/soins`, data, this.h); }
  getSoins(): Observable<any[]>                  { return this.http.get<any[]>(`${API}/mes-soins`, this.h); }
  envoyerUrgence(id: number): Observable<any>    { return this.http.post(`${API}/urgence`, { id_patient: id }, this.h); }
  getSoinsPatient(): Observable<any[]>           { return this.http.get<any[]>(`${API}/mes-soins-patient`, this.h); }
  getVaccins(): Observable<any[]>                { return this.http.get<any[]>(`${API}/mes-vaccins`, this.h); }
  getAnalyses(): Observable<any[]>               { return this.http.get<any[]>(`${API}/mes-analyses`, this.h); }
  getConsentements(): Observable<any[]>          { return this.http.get<any[]>(`${API}/mes-consentements`, this.h); }
  ajouterVaccin(data: any): Observable<any>      { return this.http.post(`${API}/vaccins`, data, this.h); }
  ajouterAnalyse(data: any): Observable<any>     { return this.http.post(`${API}/analyses`, data, this.h); }
  ajouterConsentement(data: any): Observable<any>{ return this.http.post(`${API}/consentements`, data, this.h); }

  // ── Patients ─────────────────────────────────────────────────────────────
  getPatients(): Observable<any[]>               { return this.http.get<any[]>(`${API}/patients`, this.h); }
  getMesPatients(): Observable<any[]>            { return this.http.get<any[]>(`${API}/mes-patients`, this.h); }
  getPatient(id: number): Observable<any>        { return this.http.get<any>(`${API}/patients/${id}`, this.h); }

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications(id: number): Observable<any[]>{ return this.http.get<any[]>(`${API}/notifications/${id}`, this.h); }
  marquerLue(id: number): Observable<any>        { return this.http.patch(`${API}/notifications/${id}/lu`, {}, this.h); }

  // ── Profil utilisateur ────────────────────────────────────────────────────
  updateProfil(id: number, data: any): Observable<any> { return this.http.put<any>(`${API}/utilisateurs/${id}`, data, this.h); }
  updateMedical(id: number, data: any): Observable<any> { return this.http.patch<any>(`${API}/patients/${id}/medical`, data, this.h); }
  changerMotDePasse(id: number, data: any): Observable<any> { return this.http.put<any>(`${API}/utilisateurs/${id}/mot-de-passe`, data, this.h); }

  // ── IA Triage ─────────────────────────────────────────────────────────────
  triage(symptomes: string): Observable<any>     { return this.http.post<any>(`${API}/ia-triage`, { symptomes }, this.h); }

  // ── Email ordonnance ──────────────────────────────────────────────────────
  emailOrdonnance(data: any): Observable<any>    { return this.http.post<any>(`${API}/envoyer-ordonnance`, data, this.h); }

  // ── Admin ─────────────────────────────────────────────────────────────────
  getUtilisateurs(): Observable<any[]>           { return this.http.get<any[]>(`${API}/admin/utilisateurs`, this.h); }
  creerUtilisateur(data: any): Observable<any>   { return this.http.post(`${API}/admin/utilisateurs`, data, this.h); }
  activerUtilisateur(id: number): Observable<any>    { return this.http.patch(`${API}/admin/utilisateurs/${id}/activer`, {}, this.h); }
  desactiverUtilisateur(id: number): Observable<any> { return this.http.patch(`${API}/admin/utilisateurs/${id}/desactiver`, {}, this.h); }
  supprimerUtilisateur(id: number): Observable<any>  { return this.http.delete(`${API}/admin/utilisateurs/${id}`, this.h); }
  getRapport(): Observable<any>                  { return this.http.get<any>(`${API}/admin/rapport`, this.h); }

  getAdminFactures(): Observable<any> { return this.http.get<any>(`${API}/admin/factures`, this.h); }
}