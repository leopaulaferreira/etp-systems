import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { ProfileProvider } from '../profile/ProfileContext'
import { AssessmentProvider } from '../assessments/AssessmentContext'
import AppRoutes from './routes/AppRoutes'
import { AccessibilityProvider } from '../preferences/AccessibilityContext'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <AssessmentProvider>
            <AccessibilityProvider><AppRoutes /></AccessibilityProvider>
          </AssessmentProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
