import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from '../auth/AuthContext'
import SessionGate from '../auth/SessionGate'
import { ProfileProvider } from '../profile/ProfileContext'
import AssessmentNavigationGuard from '../assessments/AssessmentNavigationGuard'
import { AssessmentProvider } from '../assessments/AssessmentContext'
import AppRoutes from './routes/AppRoutes'
import { AccessibilityProvider } from '../preferences/AccessibilityContext'

const router = createBrowserRouter([{ path: '*', element: <AuthProvider><SessionGate><SessionContent /></SessionGate></AuthProvider> }])

export default function App() {
  return <RouterProvider router={router} />
}

function SessionContent() {
  const { user } = useAuth()
  return <ProfileProvider key={user?.id ?? 'guest'}>
    <AssessmentProvider>
      <AccessibilityProvider><AssessmentNavigationGuard /><AppRoutes /></AccessibilityProvider>
    </AssessmentProvider>
  </ProfileProvider>
}
