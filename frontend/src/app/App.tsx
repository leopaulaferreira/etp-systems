import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../auth/AuthContext'
import SessionGate from '../auth/SessionGate'
import { ProfileProvider } from '../profile/ProfileContext'
import { AssessmentProvider } from '../assessments/AssessmentContext'
import AppRoutes from './routes/AppRoutes'
import { AccessibilityProvider } from '../preferences/AccessibilityContext'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionGate><SessionContent /></SessionGate>
      </AuthProvider>
    </BrowserRouter>
  )
}

function SessionContent() {
  const { user } = useAuth()
  return <ProfileProvider key={user?.id ?? 'guest'}>
    <AssessmentProvider>
      <AccessibilityProvider><AppRoutes /></AccessibilityProvider>
    </AssessmentProvider>
  </ProfileProvider>
}
