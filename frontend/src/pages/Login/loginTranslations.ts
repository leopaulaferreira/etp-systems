/** Conteúdo textual e idiomas pertencentes somente à tela 01 - LOGIN. */
export type Locale = 'pt-BR' | 'en' | 'es' | 'fr' | 'de' | 'it'

export type LoginCopy = {
  languageSelector: string
  badge: string
  headline: string
  headlineAccent: string
  description: string
  features: [
    { title: string; subtitle: string },
    { title: string; subtitle: string },
    { title: string; subtitle: string },
    { title: string; subtitle: string },
  ]
  secureLearning: string
  welcome: string
  title: string
  subtitle: string
  accessType: string
  collaborator: string
  company: string
  email: string
  emailPlaceholder: string
  password: string
  keepConnected: string
  recoverPassword: string
  submit: string
  submitting: string
  socialDivider: string
  firstAccess: string
  createAccount: string
  protectedAccess: string
  privacy: string
  terms: string
  showPassword: string
  hidePassword: string
  errors: {
    emailRequired: string
    emailInvalid: string
    passwordRequired: string
    passwordLength: string
  }
}

export const languageOptions: Array<{
  locale: Locale
  nativeName: string
  code: string
}> = [
  { locale: 'pt-BR', nativeName: 'Português', code: 'PT-BR' },
  { locale: 'en', nativeName: 'English', code: 'EN' },
  { locale: 'es', nativeName: 'Español', code: 'ES' },
  { locale: 'fr', nativeName: 'Français', code: 'FR' },
  { locale: 'de', nativeName: 'Deutsch', code: 'DE' },
  { locale: 'it', nativeName: 'Italiano', code: 'IT' },
]

export const loginTranslations: Record<Locale, LoginCopy> = {
  'pt-BR': {
    languageSelector: 'Selecionar idioma',
    badge: 'Conhecimento para avançar',
    headline: 'Conhecimento para',
    headlineAccent: 'ir além.',
    description:
      'Desenvolva habilidades, explore novas trilhas e transforme aprendizado em conquistas.',
    features: [
      { title: 'Aprendizado', subtitle: 'que transforma' },
      { title: 'Trilhas', subtitle: 'para evoluir' },
      { title: 'Certificações', subtitle: 'para conquistar' },
      { title: 'Resultados', subtitle: 'que impulsionam' },
    ],
    secureLearning: 'Ambiente seguro e confiável para seu aprendizado.',
    welcome: 'Bem-vindo de volta',
    title: 'Entre na sua conta',
    subtitle: 'Seus cursos e sua próxima conquista esperam por você.',
    accessType: 'Tipo de acesso',
    collaborator: 'Colaborador',
    company: 'Empresa / RH',
    email: 'E-mail',
    emailPlaceholder: 'nome@empresa.com',
    password: 'Senha',
    keepConnected: 'Manter conectado',
    recoverPassword: 'Recuperar senha',
    submit: 'Entrar na plataforma',
    submitting: 'Entrando...',
    socialDivider: 'ou entre com',
    firstAccess: 'Primeiro acesso?',
    createAccount: 'Como acessar',
    protectedAccess: 'Ambiente protegido para seus dados de acesso.',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Uso',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
    errors: {
      emailRequired: 'Informe seu e-mail.',
      emailInvalid: 'Digite um e-mail válido.',
      passwordRequired: 'Informe sua senha.',
      passwordLength: 'A senha deve ter pelo menos 6 caracteres.',
    },
  },
  en: {
    languageSelector: 'Select language',
    badge: 'Knowledge to move forward',
    headline: 'Advance your career with',
    headlineAccent: 'knowledge that transforms.',
    description: 'A complete platform to build skills, earn certifications, and accelerate results.',
    features: [
      { title: 'Learning', subtitle: 'that transforms' },
      { title: 'Paths', subtitle: 'to help you grow' },
      { title: 'Certifications', subtitle: 'to achieve' },
      { title: 'Results', subtitle: 'that drive progress' },
    ],
    secureLearning: 'A safe and trusted environment for your learning.',
    welcome: 'Welcome back',
    title: 'Continue your journey',
    subtitle: 'Enter your details to access your courses.',
    accessType: 'Access type',
    collaborator: 'Employee',
    company: 'Company / HR',
    email: 'Email',
    emailPlaceholder: 'name@company.com',
    password: 'Password',
    keepConnected: 'Keep me signed in',
    recoverPassword: 'Forgot password',
    submit: 'Sign in to the platform',
    submitting: 'Signing in...',
    socialDivider: 'or sign in with',
    firstAccess: 'First time here?',
    createAccount: 'Create an account',
    protectedAccess: 'A protected environment for your sign-in data.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    errors: {
      emailRequired: 'Enter your email.',
      emailInvalid: 'Enter a valid email.',
      passwordRequired: 'Enter your password.',
      passwordLength: 'The password must be at least 6 characters.',
    },
  },
  es: {
    languageSelector: 'Seleccionar idioma',
    badge: 'Conocimiento para avanzar',
    headline: 'Impulsa tu carrera con',
    headlineAccent: 'conocimiento que transforma.',
    description:
      'Una plataforma completa para desarrollar habilidades, obtener certificaciones y acelerar resultados.',
    features: [
      { title: 'Aprendizaje', subtitle: 'que transforma' },
      { title: 'Rutas', subtitle: 'para evolucionar' },
      { title: 'Certificaciones', subtitle: 'para conquistar' },
      { title: 'Resultados', subtitle: 'que impulsan' },
    ],
    secureLearning: 'Un entorno seguro y confiable para tu aprendizaje.',
    welcome: 'Bienvenido de nuevo',
    title: 'Continúa tu recorrido',
    subtitle: 'Ingresa tus datos para acceder a tus cursos.',
    accessType: 'Tipo de acceso',
    collaborator: 'Colaborador',
    company: 'Empresa / RR. HH.',
    email: 'Correo electrónico',
    emailPlaceholder: 'nombre@empresa.com',
    password: 'Contraseña',
    keepConnected: 'Mantener sesión iniciada',
    recoverPassword: 'Recuperar contraseña',
    submit: 'Entrar en la plataforma',
    submitting: 'Ingresando...',
    socialDivider: 'o ingresa con',
    firstAccess: '¿Es tu primer acceso?',
    createAccount: 'Crear una cuenta',
    protectedAccess: 'Un entorno protegido para tus datos de acceso.',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Uso',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    errors: {
      emailRequired: 'Ingresa tu correo electrónico.',
      emailInvalid: 'Ingresa un correo electrónico válido.',
      passwordRequired: 'Ingresa tu contraseña.',
      passwordLength: 'La contraseña debe tener al menos 6 caracteres.',
    },
  },
  fr: {
    languageSelector: 'Sélectionner la langue',
    badge: 'Le savoir pour avancer',
    headline: 'Faites progresser votre carrière grâce à',
    headlineAccent: 'des connaissances qui transforment.',
    description:
      'Une plateforme complète pour développer vos compétences, obtenir des certifications et accélérer vos résultats.',
    features: [
      { title: 'Apprentissage', subtitle: 'qui transforme' },
      { title: 'Parcours', subtitle: 'pour progresser' },
      { title: 'Certifications', subtitle: 'à obtenir' },
      { title: 'Résultats', subtitle: 'qui font avancer' },
    ],
    secureLearning: 'Un environnement sûr et fiable pour votre apprentissage.',
    welcome: 'Bon retour',
    title: 'Poursuivez votre parcours',
    subtitle: 'Saisissez vos informations pour accéder à vos cours.',
    accessType: "Type d'accès",
    collaborator: 'Collaborateur',
    company: 'Entreprise / RH',
    email: 'E-mail',
    emailPlaceholder: 'nom@entreprise.com',
    password: 'Mot de passe',
    keepConnected: 'Rester connecté',
    recoverPassword: 'Mot de passe oublié',
    submit: 'Accéder à la plateforme',
    submitting: 'Connexion...',
    socialDivider: 'ou continuer avec',
    firstAccess: 'Première connexion ?',
    createAccount: 'Créer un compte',
    protectedAccess: "Un environnement protégé pour vos données d'accès.",
    privacy: 'Politique de confidentialité',
    terms: "Conditions d'utilisation",
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    errors: {
      emailRequired: 'Saisissez votre e-mail.',
      emailInvalid: 'Saisissez un e-mail valide.',
      passwordRequired: 'Saisissez votre mot de passe.',
      passwordLength: 'Le mot de passe doit comporter au moins 6 caractères.',
    },
  },
  de: {
    languageSelector: 'Sprache auswählen',
    badge: 'Wissen, das weiterbringt',
    headline: 'Bringen Sie Ihre Karriere voran mit',
    headlineAccent: 'Wissen, das verändert.',
    description:
      'Eine umfassende Plattform, um Kompetenzen aufzubauen, Zertifikate zu erwerben und Ergebnisse zu beschleunigen.',
    features: [
      { title: 'Lernen', subtitle: 'das verändert' },
      { title: 'Lernpfade', subtitle: 'für Ihre Entwicklung' },
      { title: 'Zertifikate', subtitle: 'zum Erreichen' },
      { title: 'Ergebnisse', subtitle: 'die voranbringen' },
    ],
    secureLearning: 'Eine sichere und vertrauenswürdige Lernumgebung.',
    welcome: 'Willkommen zurück',
    title: 'Setzen Sie Ihre Lernreise fort',
    subtitle: 'Geben Sie Ihre Daten ein, um auf Ihre Kurse zuzugreifen.',
    accessType: 'Zugangsart',
    collaborator: 'Mitarbeiter',
    company: 'Unternehmen / HR',
    email: 'E-Mail',
    emailPlaceholder: 'name@unternehmen.de',
    password: 'Passwort',
    keepConnected: 'Angemeldet bleiben',
    recoverPassword: 'Passwort vergessen',
    submit: 'Bei der Plattform anmelden',
    submitting: 'Anmeldung...',
    socialDivider: 'oder anmelden mit',
    firstAccess: 'Zum ersten Mal hier?',
    createAccount: 'Konto erstellen',
    protectedAccess: 'Eine geschützte Umgebung für Ihre Anmeldedaten.',
    privacy: 'Datenschutzrichtlinie',
    terms: 'Nutzungsbedingungen',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort ausblenden',
    errors: {
      emailRequired: 'Geben Sie Ihre E-Mail-Adresse ein.',
      emailInvalid: 'Geben Sie eine gültige E-Mail-Adresse ein.',
      passwordRequired: 'Geben Sie Ihr Passwort ein.',
      passwordLength: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    },
  },
  it: {
    languageSelector: 'Seleziona lingua',
    badge: 'Conoscenza per crescere',
    headline: 'Fai avanzare la tua carriera con',
    headlineAccent: 'conoscenze che trasformano.',
    description:
      'Una piattaforma completa per sviluppare competenze, ottenere certificazioni e accelerare i risultati.',
    features: [
      { title: 'Apprendimento', subtitle: 'che trasforma' },
      { title: 'Percorsi', subtitle: 'per crescere' },
      { title: 'Certificazioni', subtitle: 'da conquistare' },
      { title: 'Risultati', subtitle: 'che fanno avanzare' },
    ],
    secureLearning: 'Un ambiente sicuro e affidabile per il tuo apprendimento.',
    welcome: 'Bentornato',
    title: 'Continua il tuo percorso',
    subtitle: 'Inserisci i tuoi dati per accedere ai corsi.',
    accessType: 'Tipo di accesso',
    collaborator: 'Collaboratore',
    company: 'Azienda / HR',
    email: 'E-mail',
    emailPlaceholder: 'nome@azienda.it',
    password: 'Password',
    keepConnected: 'Resta connesso',
    recoverPassword: 'Recupera password',
    submit: 'Accedi alla piattaforma',
    submitting: 'Accesso...',
    socialDivider: 'oppure accedi con',
    firstAccess: 'È il tuo primo accesso?',
    createAccount: 'Crea un account',
    protectedAccess: 'Un ambiente protetto per i tuoi dati di accesso.',
    privacy: 'Informativa sulla privacy',
    terms: "Termini d'uso",
    showPassword: 'Mostra password',
    hidePassword: 'Nascondi password',
    errors: {
      emailRequired: 'Inserisci la tua e-mail.',
      emailInvalid: 'Inserisci un indirizzo e-mail valido.',
      passwordRequired: 'Inserisci la password.',
      passwordLength: 'La password deve contenere almeno 6 caratteri.',
    },
  },
}
