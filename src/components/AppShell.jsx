import { useEffect, useState } from 'react'
import {
  Boxes,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  Files,
  Gauge,
  Menu,
  Settings,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { verificarSaude } from '../services/api'
import Toast from './Toast'

const navigation = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/novo-pedido', label: 'Novo pedido', icon: FilePlus2 },
  { to: '/pedidos', label: 'Pedidos', icon: Files },
  { to: '/revisoes', label: 'Revisões pendentes', icon: ClipboardCheck },
  { to: '/produtos', label: 'Produtos e códigos', icon: Boxes },
  { to: '/historico', label: 'Histórico', icon: Clock3 },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

const pageMeta = {
  '/': ['Dashboard', 'Visão geral da operação'],
  '/novo-pedido': ['Novo pedido', 'Processamento e conferência'],
  '/pedidos': ['Pedidos', 'Pedidos processados nesta sessão'],
  '/revisoes': ['Revisões pendentes', 'Itens que exigem conferência'],
  '/produtos': ['Produtos e correspondências', 'Catálogo e mapeamentos'],
  '/historico': ['Histórico', 'Rastreabilidade dos processamentos'],
  '/configuracoes': ['Configurações', 'Ambiente e integrações'],
}

export default function AppShell({ pedidoState }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [serviceStatus, setServiceStatus] = useState('checking')
  const location = useLocation()
  const [title, description] = pageMeta[location.pathname] || pageMeta['/']

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const controller = new AbortController()
    verificarSaude(controller.signal)
      .then(() => setServiceStatus('online'))
      .catch(() => setServiceStatus('offline'))
    return () => controller.abort()
  }, [])

  return (
    <div className="app-shell">
      <button
        className={`sidebar-backdrop ${menuOpen ? 'is-visible' : ''}`}
        type="button"
        aria-label="Fechar navegação"
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">ADI</span>
          <div>
            <strong>ADI</strong>
            <span>Automação de pedidos</span>
          </div>
          <button className="icon-button sidebar-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <span className="nav-section-label">Operação</span>
          {navigation.slice(0, 4).map((item) => <NavItem key={item.to} {...item} />)}
          <span className="nav-section-label">Administração</span>
          {navigation.slice(4).map((item) => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="sidebar-footer">
          <ServiceStatus status={serviceStatus} />
          <span className="version-label">MVP · Backend Python</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-title-group">
            <button className="icon-button mobile-menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              <Menu size={21} />
            </button>
            <div>
              <p className="breadcrumb">ADI / {title}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          </div>
          <ServiceStatus status={serviceStatus} compact />
        </header>

        <main className="page-content">
          <Outlet context={{ ...pedidoState, serviceStatus }} />
        </main>
      </div>

      {pedidoState.notificacao && (
        <Toast
          {...pedidoState.notificacao}
          onClose={() => pedidoState.setNotificacao(null)}
        />
      )}
    </div>
  )
}

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  )
}

function ServiceStatus({ status, compact = false }) {
  const labels = {
    checking: 'Verificando serviço',
    online: 'Serviço operacional',
    offline: 'Serviço indisponível',
  }
  return (
    <div className={`service-status is-${status} ${compact ? 'is-compact' : ''}`} title={labels[status]}>
      <span className="service-dot" aria-hidden="true" />
      <span>{labels[status]}</span>
    </div>
  )
}
