import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Upload, Users, FileText,
  Send, Settings, Zap, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,          label: 'Upload Payroll' },
  { to: '/employees', icon: Users,           label: 'Employees' },
  { to: '/slips',     icon: FileText,        label: 'Salary Slips' },
  { to: '/email',     icon: Send,            label: 'Email Dispatcher' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside
      style={{
        width: '200px',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
          }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              SalaryFlow
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Payroll Automation
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#a78bfa' : 'var(--text-secondary)',
              background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '12px',
          padding: '12px',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', marginBottom: '4px' }}>
            Admin Mode
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Full payroll access
          </div>
        </div>
      </div>
    </aside>
  )
}
