import type { Locale } from './loginTranslations'

type SupportCopy = {
  rememberEmail: string
  capsLock: string
  company: string
  recovery: string
  signup: string
  provider: string
  privacy: string
  terms: string
  close: string
  invalidCredentials: string
  unavailable: string
  roleMismatch: string
  expiredSession: string
}

export const loginSupportCopy: Record<Locale, SupportCopy> = {
  "pt-BR": {
    rememberEmail: "Lembrar meu e-mail",
    capsLock: "Caps Lock está ativado.",
    company: "Acesse o painel da empresa para acompanhar seus colaboradores.",
    recovery: "A recuperação de senha por e-mail ainda não está disponível. Procure o responsável pelo acesso da sua organização.",
    signup: "O cadastro público ainda não está disponível. Solicite uma conta ao responsável pelo ETP na sua organização.",
    provider: "O acesso com {provider} ainda não está integrado. Entre com o e-mail e a senha da sua conta ETP.",
    privacy: "Sua senha é enviada à API para autenticação e não é salva no navegador. O token de acesso fica nesta aba até sair ou expirar. Lembrar meu e-mail salva somente o endereço para o próximo acesso.",
    terms: "O ETP Systems é um projeto acadêmico. O acesso exige uma conta cadastrada. Cursos, progresso e certificados ainda incluem conteúdo ilustrativo.",
    close: "Entendi",
    invalidCredentials: "E-mail ou senha inválidos. Confira os dados e tente novamente.",
    unavailable: "Não foi possível entrar agora. Confira sua conexão e tente novamente.",
    roleMismatch: "Esta conta pertence ao outro perfil. Selecione Colaborador ou Empresa / RH conforme seu cadastro.",
    expiredSession: "Sua sessão expirou ou foi encerrada. Entre novamente para continuar.",
  },
  "en": {
    rememberEmail: "Remember my email",
    capsLock: "Caps Lock is on.",
    company: "Access your company dashboard to follow employee learning.",
    recovery: "Password recovery by email is not available yet. Contact the person responsible for access at your organization.",
    signup: "Public registration is not available yet. Request an account from your organization’s ETP contact.",
    provider: "{provider} sign-in is not connected yet. Use your ETP account email and password.",
    privacy: "Your password is sent to the API for authentication and is not saved in the browser. The access token stays in this tab until sign-out or expiry. Remember my email saves only your address.",
    terms: "ETP Systems is an academic project. Access requires a registered account. Courses, progress and certificates still include sample content.",
    close: "Got it",
    invalidCredentials: "Invalid email or password. Check your details and try again.",
    unavailable: "Unable to sign in right now. Check your connection and try again.",
    roleMismatch: "This account belongs to the other access type. Select Employee or Company / HR to match your account.",
    expiredSession: "Your session has expired or ended. Sign in again to continue.",
  },
  "es": {
    rememberEmail: "Recordar mi correo",
    capsLock: "Bloq Mayús está activado.",
    company: "Accede al panel de la empresa para seguir el aprendizaje de tus colaboradores.",
    recovery: "La recuperación por correo aún no está disponible. Contacta al responsable de acceso de tu organización.",
    signup: "El registro público aún no está disponible. Solicita una cuenta al responsable de ETP de tu organización.",
    provider: "El acceso con {provider} aún no está integrado. Usa el correo y la contraseña de tu cuenta ETP.",
    privacy: "Tu contraseña se envía a la API para autenticarte y no se guarda en el navegador. El token permanece en esta pestaña hasta salir o caducar. Recordar mi correo guarda solo tu dirección.",
    terms: "ETP Systems es un proyecto académico. El acceso requiere una cuenta registrada. Los cursos, avances y certificados aún incluyen contenido ilustrativo.",
    close: "Entendido",
    invalidCredentials: "Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.",
    unavailable: "No se pudo iniciar sesión. Comprueba tu conexión e inténtalo de nuevo.",
    roleMismatch: "Esta cuenta pertenece al otro perfil. Selecciona Colaborador o Empresa / RR. HH. según tu cuenta.",
    expiredSession: "Tu sesión ha caducado o finalizado. Vuelve a iniciar sesión.",
  },
  "fr": {
    rememberEmail: "Mémoriser mon e-mail",
    capsLock: "Verr. Maj est activé.",
    company: "Accédez au tableau de bord de votre entreprise pour suivre vos collaborateurs.",
    recovery: "La récupération par e-mail est encore indisponible. Contactez le responsable des accès de votre organisation.",
    signup: "L’inscription publique est encore indisponible. Demandez un compte au responsable ETP de votre organisation.",
    provider: "La connexion avec {provider} n’est pas encore intégrée. Utilisez l’e-mail et le mot de passe de votre compte ETP.",
    privacy: "Votre mot de passe est envoyé à l’API pour vous authentifier et n’est pas enregistré dans le navigateur. Le jeton reste dans cet onglet jusqu’à la déconnexion ou son expiration. Seule votre adresse e-mail est mémorisée sur demande.",
    terms: "ETP Systems est un projet académique. L’accès exige un compte enregistré. Les cours, progressions et certificats incluent encore des exemples.",
    close: "Compris",
    invalidCredentials: "E-mail ou mot de passe incorrect. Vérifiez vos informations.",
    unavailable: "Connexion impossible pour le moment. Vérifiez votre connexion et réessayez.",
    roleMismatch: "Ce compte appartient à l’autre profil. Sélectionnez Collaborateur ou Entreprise / RH selon votre compte.",
    expiredSession: "Votre session a expiré ou a pris fin. Connectez-vous à nouveau.",
  },
  "de": {
    rememberEmail: "E-Mail merken",
    capsLock: "Feststelltaste ist aktiviert.",
    company: "Verfolgen Sie den Lernfortschritt Ihrer Mitarbeitenden im Unternehmensdashboard.",
    recovery: "Die Wiederherstellung per E-Mail ist noch nicht verfügbar. Wenden Sie sich an die zuständige Person Ihrer Organisation.",
    signup: "Die öffentliche Registrierung ist noch nicht verfügbar. Fordern Sie ein Konto bei Ihrer ETP-Ansprechperson an.",
    provider: "Die Anmeldung mit {provider} ist noch nicht integriert. Verwenden Sie E-Mail und Passwort Ihres ETP-Kontos.",
    privacy: "Ihr Passwort wird zur Anmeldung an die API gesendet und nicht im Browser gespeichert. Der Zugriffstoken bleibt bis zur Abmeldung oder zum Ablauf in diesem Tab. Auf Wunsch wird nur Ihre E-Mail-Adresse gespeichert.",
    terms: "ETP Systems ist ein akademisches Projekt. Der Zugang erfordert ein registriertes Konto. Kurse, Fortschritte und Zertifikate enthalten weiterhin Beispieldaten.",
    close: "Verstanden",
    invalidCredentials: "E-Mail oder Passwort ungültig. Prüfen Sie Ihre Eingaben.",
    unavailable: "Anmeldung derzeit nicht möglich. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    roleMismatch: "Dieses Konto gehört zum anderen Profil. Wählen Sie Mitarbeiter oder Unternehmen / HR entsprechend Ihrem Konto.",
    expiredSession: "Ihre Sitzung ist abgelaufen oder beendet. Melden Sie sich erneut an.",
  },
  "it": {
    rememberEmail: "Ricorda la mia e-mail",
    capsLock: "Bloc Maiusc è attivo.",
    company: "Accedi al pannello aziendale per seguire i progressi dei collaboratori.",
    recovery: "Il recupero tramite e-mail non è ancora disponibile. Contatta il responsabile degli accessi della tua organizzazione.",
    signup: "La registrazione pubblica non è ancora disponibile. Richiedi un account al referente ETP della tua organizzazione.",
    provider: "L’accesso con {provider} non è ancora integrato. Usa e-mail e password del tuo account ETP.",
    privacy: "La password viene inviata all’API per autenticarti e non viene salvata nel browser. Il token rimane in questa scheda fino all’uscita o alla scadenza. Ricorda la mia e-mail salva solo il tuo indirizzo.",
    terms: "ETP Systems è un progetto accademico. L’accesso richiede un account registrato. Corsi, progressi e certificati includono ancora contenuti illustrativi.",
    close: "Ho capito",
    invalidCredentials: "E-mail o password non valide. Controlla i dati e riprova.",
    unavailable: "Accesso non disponibile al momento. Controlla la connessione e riprova.",
    roleMismatch: "Questo account appartiene all’altro profilo. Seleziona Collaboratore o Azienda / HR secondo il tuo account.",
    expiredSession: "La sessione è scaduta o terminata. Accedi di nuovo.",
  },
}
