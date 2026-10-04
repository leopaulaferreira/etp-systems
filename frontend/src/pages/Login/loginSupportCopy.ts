import type { Locale } from './loginTranslations'

type SupportCopy = {
  demo: string
  rememberEmail: string
  capsLock: string
  company: string
  recovery: string
  signup: string
  provider: string
  privacy: string
  terms: string
  close: string
}

export const loginSupportCopy: Record<Locale, SupportCopy> = {
  'pt-BR': {
    demo: 'Versão demonstrativa',
    rememberEmail: 'Lembrar meu e-mail',
    capsLock: 'Caps Lock está ativado.',
    company: 'No protótipo, os dois perfis acessam o mesmo ambiente de aprendizagem.',
    recovery: 'A recuperação de senha estará disponível com a autenticação real. Nesta demonstração, use um e-mail válido e uma senha de pelo menos 6 caracteres. Não use sua senha pessoal.',
    signup: 'O cadastro institucional será disponibilizado com a integração da plataforma. Para explorar a demonstração, informe um e-mail válido e uma senha de pelo menos 6 caracteres.',
    provider: 'O acesso com {provider} ainda não está integrado. Use o formulário para explorar a demonstração.',
    privacy: 'Esta demonstração guarda preferências neste navegador. Ao marcar “Lembrar meu e-mail”, somente o e-mail é salvo. A senha não é armazenada nem enviada a um serviço de autenticação.',
    terms: 'O ETP Systems é um projeto acadêmico em demonstração. Cursos, resultados e certificados são ilustrativos. O acesso ainda não valida uma identidade real.',
    close: 'Entendi',
  },
  en: {
    demo: 'Demo version', rememberEmail: 'Remember my email', capsLock: 'Caps Lock is on.',
    company: 'Both profiles use the same learning environment in this demo.',
    recovery: 'Password recovery will be available with real authentication. For this demo, use a valid email and at least 6 password characters. Do not use your personal password.',
    signup: 'Institutional registration will be available after integration. Explore this demo with a valid email and at least 6 password characters.',
    provider: '{provider} sign-in is not connected yet. Use the form to explore the demo.',
    privacy: 'This demo stores preferences in your browser. “Remember my email” saves only your email. Passwords are neither stored nor sent to an authentication service.',
    terms: 'ETP Systems is an academic demo. Courses, results and certificates are illustrative. Sign-in does not verify a real identity.', close: 'Got it',
  },
  es: {
    demo: 'Versión de demostración', rememberEmail: 'Recordar mi correo', capsLock: 'Bloq Mayús está activado.',
    company: 'Ambos perfiles acceden al mismo entorno de aprendizaje en esta demostración.',
    recovery: 'La recuperación estará disponible con la autenticación real. Usa un correo válido y una contraseña de al menos 6 caracteres. No uses tu contraseña personal.',
    signup: 'El registro institucional estará disponible después de la integración. Explora la demo con un correo válido y al menos 6 caracteres de contraseña.',
    provider: 'El acceso con {provider} aún no está integrado. Usa el formulario para explorar la demo.',
    privacy: 'Esta demo guarda preferencias en tu navegador. “Recordar mi correo” guarda solo el correo. No se guarda ni se envía la contraseña a un servicio de autenticación.',
    terms: 'ETP Systems es una demostración académica. Los cursos, resultados y certificados son ilustrativos. El acceso no verifica una identidad real.', close: 'Entendido',
  },
  fr: {
    demo: 'Version de démonstration', rememberEmail: 'Mémoriser mon e-mail', capsLock: 'Verr. Maj est activé.',
    company: 'Les deux profils utilisent le même espace de formation dans cette démonstration.',
    recovery: 'La récupération sera disponible avec une authentification réelle. Utilisez un e-mail valide et au moins 6 caractères. Ne saisissez pas votre mot de passe personnel.',
    signup: 'L’inscription sera disponible après intégration. Explorez la démo avec un e-mail valide et au moins 6 caractères pour le mot de passe.',
    provider: 'La connexion avec {provider} n’est pas encore intégrée. Utilisez le formulaire pour explorer la démo.',
    privacy: 'Cette démo conserve les préférences dans votre navigateur. Seul votre e-mail est mémorisé si vous le choisissez. Le mot de passe n’est ni enregistré ni envoyé à un service d’authentification.',
    terms: 'ETP Systems est une démonstration académique. Les cours, résultats et certificats sont illustratifs. La connexion ne vérifie pas une identité réelle.', close: 'Compris',
  },
  de: {
    demo: 'Demoversion', rememberEmail: 'E-Mail merken', capsLock: 'Feststelltaste ist aktiviert.',
    company: 'Beide Profile verwenden in dieser Demo dieselbe Lernumgebung.',
    recovery: 'Die Wiederherstellung folgt mit echter Anmeldung. Verwenden Sie eine gültige E-Mail und mindestens 6 Passwortzeichen. Verwenden Sie kein persönliches Passwort.',
    signup: 'Die Registrierung folgt nach der Integration. Erkunden Sie die Demo mit einer gültigen E-Mail und mindestens 6 Passwortzeichen.',
    provider: 'Die Anmeldung mit {provider} ist noch nicht verbunden. Verwenden Sie das Formular für die Demo.',
    privacy: 'Diese Demo speichert Einstellungen im Browser. Auf Wunsch wird nur die E-Mail gespeichert. Passwörter werden weder gespeichert noch an einen Anmeldedienst gesendet.',
    terms: 'ETP Systems ist ein akademisches Demoprojekt. Kurse, Ergebnisse und Zertifikate dienen zur Illustration. Die Anmeldung prüft keine echte Identität.', close: 'Verstanden',
  },
  it: {
    demo: 'Versione dimostrativa', rememberEmail: 'Ricorda la mia e-mail', capsLock: 'Bloc Maiusc è attivo.',
    company: 'Entrambi i profili usano lo stesso ambiente di apprendimento nella demo.',
    recovery: 'Il recupero sarà disponibile con l’autenticazione reale. Usa un’e-mail valida e almeno 6 caratteri per la password. Non usare la tua password personale.',
    signup: 'La registrazione sarà disponibile dopo l’integrazione. Esplora la demo con un’e-mail valida e almeno 6 caratteri per la password.',
    provider: 'L’accesso con {provider} non è ancora integrato. Usa il modulo per esplorare la demo.',
    privacy: 'Questa demo salva le preferenze nel browser. Su richiesta viene salvata solo l’e-mail. La password non viene salvata né inviata a un servizio di autenticazione.',
    terms: 'ETP Systems è una demo accademica. Corsi, risultati e certificati sono illustrativi. L’accesso non verifica un’identità reale.', close: 'Ho capito',
  },
}
