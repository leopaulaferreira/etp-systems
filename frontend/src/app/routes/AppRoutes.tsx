import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from '../../auth/RequireAuth'
import AppLayout from '../../layouts/AppLayout'
import LoginPage from '../../pages/Login/LoginPage'
import DashboardPage from '../../pages/Dashboard/DashboardPage'
import TrilhasPage from '../../pages/Trilhas/TrilhasPage'
import CursosPage from '../../pages/Cursos/CursosPage'
import MeusCursosPage from '../../pages/MeusCursos/MeusCursosPage'
import ComingSoonPage from '../../pages/ComingSoonPage'
import AvaliacoesPage from '../../pages/Avaliacoes/AvaliacoesPage'
import CertificadosPage from '../../pages/Certificados/CertificadosPage'
import RelatoriosPage from '../../pages/Relatorios/RelatoriosPage'
import PerfilPage from '../../pages/Perfil/PerfilPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trilhas" element={<TrilhasPage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/meus-cursos" element={<MeusCursosPage />} />
          <Route path="/avaliacoes" element={<AvaliacoesPage />} />
          <Route path="/certificados" element={<CertificadosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/configuracoes" element={<ComingSoonPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
