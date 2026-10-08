import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { homeForRole, type AccountRole } from './auth'

/** A sessão foi validada na API antes de liberar a navegação. */
export default function RequireAuth({ role: requiredRole }: { role?: AccountRole }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredRole && role !== requiredRole) return <Navigate to={homeForRole(role)} replace />
  return <Outlet />
}
