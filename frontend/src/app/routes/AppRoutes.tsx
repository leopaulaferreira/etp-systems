import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from '../../auth/RequireAuth'
import AppLayout from '../../layouts/AppLayout'
import DashboardPage from '../../pages/Dashboard/DashboardPage'
import TrilhasPage from '../../pages/Trilhas/TrilhasPage'
import CursosPage from '../../pages/Cursos/CursosPage'
import MeusCursosPage from '../../pages/MeusCursos/MeusCursosPage'
import AvaliacoesPage from '../../pages/Avaliacoes/AvaliacoesPage'
import CertificadosPage from '../../pages/Certificados/CertificadosPage'
import RelatoriosPage from '../../pages/Relatorios/RelatoriosPage'
import PerfilPage from '../../pages/Perfil/PerfilPage'
import ConfiguracoesPage from '../../pages/Configuracoes/ConfiguracoesPage'
import { useAuth } from '../../auth/AuthContext'
import { homeForRole } from '../../auth/auth'

const AjudaPage = lazy(() => import('../../pages/Ajuda/AjudaPage'))
const LoginPage = lazy(() => import('../../pages/Login/LoginPage'))
const EmpresaPage = lazy(() => import('../../pages/Empresa/EmpresaPage'))

const ColaboradoresPage = lazy(() => import('../../pages/Empresa/ColaboradoresPage'))
const CompanyRecordsPage = lazy(() => import('../../pages/Empresa/CompanyRecordsPage'))
const CompanySettingsPage = lazy(() => import('../../pages/Empresa/CompanySettingsPage'))

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  return <Navigate to={isAuthenticated ? homeForRole(role) : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<p role="status" className="p-6 text-sm text-ink-500">Carregando acesso...</p>}><LoginPage /></Suspense>} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route element={<RequireAuth role="colaborador" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trilhas" element={<TrilhasPage />} />
            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/meus-cursos" element={<MeusCursosPage />} />
            <Route path="/avaliacoes" element={<AvaliacoesPage />} />
            <Route path="/certificados" element={<CertificadosPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
          <Route element={<RequireAuth role="empresa" />}>
            <Route path="/empresa/dashboard" element={<Suspense fallback={<p role="status" className="text-sm text-ink-500">Carregando painel da empresa...</p>}><EmpresaPage /></Suspense>} />
            <Route path="/empresa/colaboradores" element={<Suspense fallback={<p role="status">Carregando colaboradores...</p>}><ColaboradoresPage /></Suspense>} />
            <Route path="/empresa/avaliacoes" element={<Suspense fallback={<p role="status">Carregando avaliações...</p>}><CompanyRecordsPage key="assessments" kind="assessments" /></Suspense>} />
            <Route path="/empresa/certificados" element={<Suspense fallback={<p role="status">Carregando certificados...</p>}><CompanyRecordsPage key="certificates" kind="certificates" /></Suspense>} />
            <Route path="/empresa/configuracoes" element={<Navigate to="/empresa/configuracoes/dados" replace />} />
            <Route path="/empresa/configuracoes/:section" element={<Suspense fallback={<p role="status">Carregando configurações...</p>}><CompanySettingsPage /></Suspense>} />
          </Route>
          <Route path="/ajuda" element={<Suspense fallback={<p role="status" className="text-sm text-ink-500">Carregando Central de Ajuda...</p>}><AjudaPage /></Suspense>} />
        </Route>
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
