import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LangService {
  currentLang: 'fr' | 'en' | 'ar' = 'fr';

  private t: any = {
    fr: {
      // Navigation
      accueil: 'Accueil', rdv: 'Rendez-vous', dossier: 'Dossier médical',
      ordonnances: 'Ordonnances', notifications: 'Notifications', profil: 'Mon profil',
      messages: 'Messages', soins: 'Soins infirmiers', planning: 'Mon planning',
      consultation: 'Consultation', dossiers: 'Dossiers patients', dispos: 'Disponibilités',
      file_attente: "File d'attente", dashboard: 'Tableau de bord', users: 'Utilisateurs',
      // Accueil patient
      bonjour: 'Bonjour', bienvenue: 'Bienvenue sur votre espace santé numérique',
      mes_rdv: 'Mes rendez-vous', mes_ordonnances: 'Mes ordonnances', dossier_medical: 'Dossier médical',
      // Actions
      prendre_rdv: 'Prendre un rendez-vous', annuler: 'Annuler', confirmer: 'Confirmer',
      envoyer: 'Envoyer', sauvegarder: 'Sauvegarder', imprimer: 'Imprimer',
      actualiser: 'Actualiser', fermer: 'Fermer', retour: 'Retour',
      se_connecter: 'Se connecter', creer_compte: 'Créer un compte', deconnexion: 'Déconnexion',
      analyser: 'Analyser avec IA', urgence: "Bouton d'urgence médicale",
      // Formulaires
      email: 'Adresse email', mot_de_passe: 'Mot de passe', nom: 'Nom', prenom: 'Prénom',
      telephone: 'Téléphone', genre: 'Genre', date_naissance: 'Date de naissance',
      groupe_sanguin: 'Groupe sanguin', allergies: 'Allergies', antecedents: 'Antécédents médicaux',
      // Chat
      ecrire_message: 'Écrire un message...', aucun_message: 'Aucun message. Commencez la conversation !',
      // Status
      en_attente: 'En attente', confirme: 'Confirmé', arrive: 'Arrivé', termine: 'Terminé', annule: 'Annulé',
      // Pages
      aucune_notif: 'Aucune notification', aucun_rdv: 'Aucun rendez-vous',
      chargement: 'Chargement...', connexion: 'Connexion...',
      notifs_non_lues: 'Notifications non lues', confirmes: 'Confirmés',
      choisir_medecin: 'Choisir un médecin', historique_rdv: 'Historique des rendez-vous',
      historique_consultations: 'Historique des consultations', score_sante: 'Score de santé IA',
      evolution_sante: 'Évolution de santé', aucune_ordonnance: 'Aucune ordonnance', infos_perso: 'Informations personnelles',
      changer_mdp: 'Changer le mot de passe', diagnostic: 'Diagnostic', traitement: 'Traitement',
      soins_inf: 'Soins infirmiers',
      gestion_rdv: 'Gestion des rendez-vous', maj_auto: 'Mise à jour automatique',
      retour_planning: 'Retour au planning', consulter: 'Consulter',
      terminer_consultation: 'Terminer la consultation', generer_ordonnance: 'Générer ordonnance',
      certificat_medical: 'Certificat médical', recu_consultation: 'Reçu de consultation',
      envoyer_email: 'Envoyer par email', ajouter_medicament: 'Ajouter un médicament',
      enregistrer: 'Enregistrer', ajouter_dispo: 'Ajouter une disponibilité',
      supprimer: 'Supprimer', analyser_dossier: 'Analyser mon dossier',
      fiche_patient: 'Fiche patient PDF', carte_patient: 'Carte patient',
      marquer_arrivee: 'Marquer arrivée', observations: 'Observations',
      type_soin: 'Type de soin', aucune_consultation: 'Aucune consultation',
      aucun_patient: 'Aucun patient', aucun_soin: 'Aucun soin enregistré',
      placeholder_diagnostic: 'Diagnostic clinique...', placeholder_traitement: 'Traitement recommandé...',
      placeholder_motif: 'Motif de la consultation...', rdv_avenir: 'Rendez-vous à venir',
      patients_aujourdhui: "Patients aujourd'hui", mes_dispos: 'Mes disponibilités',
      chat_sub: 'Communiquez directement avec votre médecin',
      chat_sub_med: 'Communiquez directement avec vos patients', ia_title: 'Analyse intelligente des symptômes', ia_label: 'Décrivez vos symptômes',
    },
    en: {
      accueil: 'Home', rdv: 'Appointments', dossier: 'Medical Record',
      ordonnances: 'Prescriptions', notifications: 'Notifications', profil: 'My Profile',
      messages: 'Messages', soins: 'Nursing Care', planning: 'My Schedule',
      consultation: 'Consultation', dossiers: 'Patient Files', dispos: 'Availability',
      file_attente: 'Waiting Queue', dashboard: 'Dashboard', users: 'Users',
      bonjour: 'Hello', bienvenue: 'Welcome to your digital health space',
      mes_rdv: 'My appointments', mes_ordonnances: 'My prescriptions', dossier_medical: 'Medical record',
      prendre_rdv: 'Book an appointment', annuler: 'Cancel', confirmer: 'Confirm',
      envoyer: 'Send', sauvegarder: 'Save', imprimer: 'Print',
      actualiser: 'Refresh', fermer: 'Close', retour: 'Back',
      se_connecter: 'Sign In', creer_compte: 'Create Account', deconnexion: 'Logout',
      analyser: 'Analyze with AI', urgence: 'Medical Emergency Button',
      email: 'Email address', mot_de_passe: 'Password', nom: 'Last name', prenom: 'First name',
      telephone: 'Phone', genre: 'Gender', date_naissance: 'Date of birth',
      groupe_sanguin: 'Blood type', allergies: 'Allergies', antecedents: 'Medical history',
      ecrire_message: 'Write a message...', aucun_message: 'No messages. Start the conversation!',
      en_attente: 'Pending', confirme: 'Confirmed', arrive: 'Arrived', termine: 'Done', annule: 'Cancelled',
      aucune_notif: 'No notifications', aucun_rdv: 'No appointments',
      chargement: 'Loading...', connexion: 'Signing in...',
      notifs_non_lues: 'Unread notifications', confirmes: 'Confirmed',
      choisir_medecin: 'Choose a doctor', historique_rdv: 'Appointment history',
      historique_consultations: 'Consultation history', score_sante: 'AI Health Score',
      evolution_sante: 'Health evolution', aucune_ordonnance: 'No prescriptions', infos_perso: 'Personal information',
      changer_mdp: 'Change password', diagnostic: 'Diagnosis', traitement: 'Treatment',
      soins_inf: 'Nursing care',
      gestion_rdv: 'Appointment management', maj_auto: 'Auto update every 15 seconds',
      retour_planning: 'Back to schedule', consulter: 'Consult',
      terminer_consultation: 'End consultation', generer_ordonnance: 'Generate prescription',
      certificat_medical: 'Medical certificate', recu_consultation: 'Consultation receipt',
      envoyer_email: 'Send by email', ajouter_medicament: 'Add medication',
      enregistrer: 'Save', ajouter_dispo: 'Add availability',
      supprimer: 'Delete', analyser_dossier: 'Analyze my file',
      fiche_patient: 'Patient PDF', carte_patient: 'Patient card',
      marquer_arrivee: 'Mark arrival', observations: 'Observations',
      type_soin: 'Care type', aucune_consultation: 'No consultations',
      aucun_patient: 'No patients', aucun_soin: 'No care recorded',
      placeholder_diagnostic: 'Clinical diagnosis...', placeholder_traitement: 'Recommended treatment...',
      placeholder_motif: 'Reason for consultation...', rdv_avenir: 'Upcoming appointments',
      patients_aujourdhui: "Today's patients", mes_dispos: 'My availabilities',
      chat_sub: 'Communicate directly with your doctor',
      chat_sub_med: 'Communicate directly with your patients', ia_title: 'AI Symptom Analysis', ia_label: 'Describe your symptoms',
    },
    ar: {
      accueil: 'الرئيسية', rdv: 'المواعيد', dossier: 'الملف الطبي',
      ordonnances: 'الوصفات', notifications: 'الإشعارات', profil: 'ملفي الشخصي',
      messages: 'الرسائل', soins: 'الرعاية التمريضية', planning: 'جدولي',
      consultation: 'الاستشارة', dossiers: 'ملفات المرضى', dispos: 'التوفر',
      file_attente: 'قائمة الانتظار', dashboard: 'لوحة التحكم', users: 'المستخدمون',
      bonjour: 'مرحباً', bienvenue: 'مرحباً بك في فضاءك الصحي الرقمي',
      mes_rdv: 'مواعيدي', mes_ordonnances: 'وصفاتي', dossier_medical: 'الملف الطبي',
      prendre_rdv: 'حجز موعد', annuler: 'إلغاء', confirmer: 'تأكيد',
      envoyer: 'إرسال', sauvegarder: 'حفظ', imprimer: 'طباعة',
      actualiser: 'تحديث', fermer: 'إغلاق', retour: 'رجوع',
      se_connecter: 'تسجيل الدخول', creer_compte: 'إنشاء حساب', deconnexion: 'تسجيل الخروج',
      analyser: 'تحليل بالذكاء الاصطناعي', urgence: 'زر الطوارئ الطبية',
      email: 'البريد الإلكتروني', mot_de_passe: 'كلمة المرور', nom: 'اللقب', prenom: 'الاسم',
      telephone: 'الهاتف', genre: 'الجنس', date_naissance: 'تاريخ الميلاد',
      groupe_sanguin: 'فصيلة الدم', allergies: 'الحساسية', antecedents: 'السوابق الطبية',
      ecrire_message: 'اكتب رسالة...', aucun_message: 'لا توجد رسائل. ابدأ المحادثة!',
      en_attente: 'في الانتظار', confirme: 'مؤكد', arrive: 'وصل', termine: 'منتهي', annule: 'ملغى',
      aucune_notif: 'لا توجد إشعارات', aucun_rdv: 'لا توجد مواعيد',
      chargement: 'جار التحميل...', connexion: 'جار تسجيل الدخول...',
      notifs_non_lues: 'إشعارات غير مقروءة', confirmes: 'مؤكدة',
      choisir_medecin: 'اختر طبيباً', historique_rdv: 'سجل المواعيد',
      historique_consultations: 'سجل الاستشارات', score_sante: 'نقاط الصحة بالذكاء الاصطناعي',
      evolution_sante: 'تطور الصحة', aucune_ordonnance: 'لا توجد وصفات', infos_perso: 'المعلومات الشخصية',
      changer_mdp: 'تغيير كلمة المرور', diagnostic: 'التشخيص', traitement: 'العلاج',
      soins_inf: 'الرعاية التمريضية',
      gestion_rdv: 'إدارة المواعيد', maj_auto: 'تحديث تلقائي كل 15 ثانية',
      retour_planning: 'العودة للجدول', consulter: 'استشارة',
      terminer_consultation: 'إنهاء الاستشارة', generer_ordonnance: 'إنشاء وصفة',
      certificat_medical: 'شهادة طبية', recu_consultation: 'إيصال الاستشارة',
      envoyer_email: 'إرسال بالبريد', ajouter_medicament: 'إضافة دواء',
      enregistrer: 'حفظ', ajouter_dispo: 'إضافة توفر',
      supprimer: 'حذف', analyser_dossier: 'تحليل ملفي',
      fiche_patient: 'ملف المريض PDF', carte_patient: 'بطاقة المريض',
      marquer_arrivee: 'تسجيل الوصول', observations: 'ملاحظات',
      type_soin: 'نوع الرعاية', aucune_consultation: 'لا توجد استشارات',
      aucun_patient: 'لا يوجد مرضى', aucun_soin: 'لا توجد رعاية مسجلة',
      placeholder_diagnostic: 'التشخيص السريري...', placeholder_traitement: 'العلاج الموصى به...',
      placeholder_motif: 'سبب الاستشارة...', rdv_avenir: 'المواعيد القادمة',
      patients_aujourdhui: 'مرضى اليوم', mes_dispos: 'توفراتي',
      chat_sub: 'تواصل مباشرة مع طبيبك',
      chat_sub_med: 'تواصل مباشرة مع مرضاك', ia_title: 'تحليل الأعراض بالذكاء الاصطناعي', ia_label: 'صف أعراضك',
    }
  };

  constructor() {
    const saved = localStorage.getItem('medinova_lang') as 'fr' | 'en' | 'ar';
    if (saved) this.setLang(saved);
  }

  setLang(lang: 'fr' | 'en' | 'ar') {
    this.currentLang = lang;
    localStorage.setItem('medinova_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  get(key: string): string {
    return this.t[this.currentLang]?.[key] || this.t['fr']?.[key] || key;
  }

  get isRTL(): boolean { return this.currentLang === 'ar'; }
}