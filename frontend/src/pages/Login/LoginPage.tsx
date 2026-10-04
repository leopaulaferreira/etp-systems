import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Building2, ChevronDown, Eye, EyeOff, Globe,
  GraduationCap, LockKeyhole, Mail, Route, TrendingUp, UserRound,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import IllustratedIcon from '../../components/ui/IllustratedIcon'
import Input from '../../components/ui/Input'
import Checkbox from '../../components/ui/Checkbox'
import { GoogleIcon, MicrosoftIcon } from './components/BrandIcons'
import LoginBackdrop from './components/LoginBackdrop'
import LoginIllustration from './components/LoginIllustration'
import CertificateDialog from '../Certificados/components/CertificateDialog'
import { useAuth } from '../../auth/AuthContext'
import etpSymbol from '../../assets/etp-symbol-white.svg'
import { languageOptions, loginTranslations, type Locale } from './loginTranslations'
import { loginSupportCopy } from './loginSupportCopy'
import './login.css'

type AccountType = 'colaborador' | 'empresa'
type HelpTopic = 'recovery' | 'signup' | 'privacy' | 'terms' | 'Google' | 'Microsoft'
const EMAIL_KEY = 'etp-login-email'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const featureIcons = [GraduationCap, Route, BadgeCheck, TrendingUp]
const featureTones = ['blue', 'teal', 'violet', 'emerald'] as const

function readSaved(key: string) {
  try { return window.localStorage.getItem(key) ?? '' } catch { return '' }
}
function getInitialLocale(): Locale {
  const saved = readSaved('etp-locale')
  return languageOptions.some(({ locale }) => locale === saved) ? saved as Locale : 'pt-BR'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const [accountType, setAccountType] = useState<AccountType>('colaborador')
  const [email, setEmail] = useState(() => readSaved(EMAIL_KEY))
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberEmail, setRememberEmail] = useState(() => Boolean(readSaved(EMAIL_KEY)))
  const [capsLock, setCapsLock] = useState(false)
  const [loading, setLoading] = useState(false)
  const [help, setHelp] = useState<HelpTopic | null>(null)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const submitTimer = useRef<number | undefined>(undefined)
  const copy = loginTranslations[locale]
  const support = loginSupportCopy[locale]

  useEffect(() => {
    const previous = document.documentElement.lang
    document.documentElement.lang = locale
    try { window.localStorage.setItem('etp-locale', locale) } catch { /* Idioma disponível nesta sessão. */ }
    return () => { document.documentElement.lang = previous }
  }, [locale])
  useEffect(() => () => window.clearTimeout(submitTimer.current), [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (loading) return
    const normalizedEmail = email.trim()
    const nextErrors: typeof errors = {}
    if (!normalizedEmail) nextErrors.email = copy.errors.emailRequired
    else if (!emailPattern.test(normalizedEmail)) nextErrors.email = copy.errors.emailInvalid
    if (!password) nextErrors.password = copy.errors.passwordRequired
    else if (password.length < 6) nextErrors.password = copy.errors.passwordLength
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) {
      if (nextErrors.email) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }
    setEmail(normalizedEmail)
    setLoading(true)
    submitTimer.current = window.setTimeout(() => {
      try {
        if (rememberEmail) localStorage.setItem(EMAIL_KEY, normalizedEmail)
        else localStorage.removeItem(EMAIL_KEY)
      } catch { /* O login demonstrativo não depende de armazenamento local. */ }
      login()
      navigate('/dashboard', { replace: true })
    }, 600)
  }

  const helpTitle = help === 'recovery' ? copy.recoverPassword
    : help === 'signup' ? copy.createAccount
      : help === 'privacy' ? copy.privacy
        : help === 'terms' ? copy.terms : help ?? ''
  const helpMessage = help === 'Google' || help === 'Microsoft'
    ? support.provider.replace('{provider}', help)
    : help ? support[help] : ''

  return (
    <main className="login-shell">
      <LoginBackdrop />
      <header className="login-header">
        <a href="/login" className="login-wordmark" aria-label="ETP Systems">
          <img src={etpSymbol} alt="" width="40" height="40" />
          <span><strong>ETP</strong><span>Systems</span></span>
        </a>
        <div className="login-language">
          <Globe size={16} aria-hidden="true" />
          <select
            aria-label={copy.languageSelector}
            value={locale}
            onChange={(event) => { setLocale(event.target.value as Locale); setErrors({}) }}
          >
            {languageOptions.map((language) => <option key={language.locale} value={language.locale}>{language.nativeName}</option>)}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </div>
      </header>

      <div className="login-main">
        <section className="login-brand-panel" aria-labelledby="login-brand-title">
          <div className="login-brand-copy">
            <span className="login-eyebrow"><span />{copy.badge}</span>
            <h1 id="login-brand-title">{copy.headline}<br /><span>{copy.headlineAccent}</span></h1>
            <p>{copy.description}</p>
          </div>
          <LoginIllustration />
          <ul className="login-features">
            {copy.features.map((feature, index) => {
              const Icon = featureIcons[index]
              return <li key={feature.title}><IllustratedIcon icon={Icon} tone={featureTones[index]} size="compact" /><span><strong>{feature.title}</strong><small>{feature.subtitle}</small></span></li>
            })}
          </ul>
        </section>

        <section className="login-auth-panel" aria-labelledby="login-title">
          <div className="login-card">
            <div className="login-card-heading">
              <span className="login-eyebrow">{copy.welcome}</span>
              <h2 id="login-title">{copy.title}</h2>
              <p>{copy.subtitle}</p>
            </div>

            <div className="login-access-tabs" role="group" aria-label={copy.accessType}>
              {([
                ['colaborador', copy.collaborator, UserRound],
                ['empresa', copy.company, Building2],
              ] as const).map(([type, label, Icon]) => (
                <button key={type} type="button" aria-pressed={accountType === type} onClick={() => setAccountType(type)} disabled={loading}>
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />{label}
                </button>
              ))}
            </div>
            {accountType === 'empresa' && <p className="login-company-note" role="status">{support.company}</p>}

            <form className="login-form" onSubmit={handleSubmit} noValidate aria-busy={loading}>
              <Input
                ref={emailRef} id="email" label={copy.email} type="email"
                placeholder={copy.emailPlaceholder} icon={<Mail size={17} strokeWidth={1.6} aria-hidden="true" />}
                value={email} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })) }}
                error={errors.email} autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false}
                required disabled={loading} tone="dark"
              />
              <div>
                <Input
                  ref={passwordRef} id="password" label={copy.password} type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" icon={<LockKeyhole size={17} strokeWidth={1.6} aria-hidden="true" />}
                  value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })) }}
                  onKeyUp={(event) => setCapsLock(event.getModifierState('CapsLock'))}
                  onBlur={() => setCapsLock(false)}
                  error={errors.password} autoComplete="current-password" required disabled={loading} tone="dark"
                  aria-describedby={capsLock ? 'caps-lock-notice' : undefined}
                  trailing={<button type="button" className="login-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-pressed={showPassword} aria-label={showPassword ? copy.hidePassword : copy.showPassword}>
                    {showPassword ? <EyeOff size={18} strokeWidth={1.6} aria-hidden="true" /> : <Eye size={18} strokeWidth={1.6} aria-hidden="true" />}
                  </button>}
                />
                {capsLock && <p id="caps-lock-notice" className="login-caps-notice" role="status">{support.capsLock}</p>}
              </div>
              <div className="login-form-options">
                <Checkbox id="remember" label={support.rememberEmail} checked={rememberEmail} disabled={loading} tone="dark" onChange={(event) => {
                  setRememberEmail(event.target.checked)
                  if (!event.target.checked) { try { localStorage.removeItem(EMAIL_KEY) } catch { /* Armazenamento indisponível. */ } }
                }} />
                <button type="button" className="login-text-button" onClick={() => setHelp('recovery')}>{copy.recoverPassword}</button>
              </div>
              <Button type="submit" loading={loading} loadingLabel={copy.submitting} className="login-submit-button">
                <span className="inline-flex items-center gap-2">{copy.submit}<ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" /></span>
              </Button>
            </form>

            <div className="login-divider"><span />{copy.socialDivider}<span /></div>
            <div className="login-social-buttons">
              <button type="button" disabled={loading} onClick={() => setHelp('Google')}><GoogleIcon className="h-4 w-4" />Google</button>
              <button type="button" disabled={loading} onClick={() => setHelp('Microsoft')}><MicrosoftIcon className="h-4 w-4" />Microsoft</button>
            </div>
            <p className="login-signup">{copy.firstAccess} <button type="button" className="login-text-button" onClick={() => setHelp('signup')}>{copy.createAccount}<ArrowRight size={13} aria-hidden="true" /></button></p>
          </div>
          <footer className="login-auth-footer">
            <div><button type="button" onClick={() => setHelp('privacy')}>{copy.privacy}</button><span aria-hidden="true">·</span><button type="button" onClick={() => setHelp('terms')}>{copy.terms}</button></div>
          </footer>
        </section>
      </div>
      {help && <CertificateDialog title={helpTitle} onClose={() => setHelp(null)}><p className="text-sm leading-7 text-ink-700">{helpMessage}</p><Button onClick={() => setHelp(null)} className="self-end">{support.close}</Button></CertificateDialog>}
    </main>
  )
}
