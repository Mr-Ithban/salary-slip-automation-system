import { useLocation } from 'react-router-dom'
import { Bell, Search, User } from 'lucide-react'

const pageLabels = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload Payroll',
  '/employees': 'Employee Management',
  '/slips':     'Salary Slips',
  '/email':     'Email Dispatcher',
  '/settings':  'Settings',
}

export default function Navbar() {
  const location = useLocation()
  const label = pageLabels[location.pathname] || 'SalaryFlow'

  return (
    <header
      style={{
        height: '64px',
        background: 'rgba(13,13,20,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          {label}
        </h1>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '1px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
          borderRadius: '10px', padding: '8px 14px',
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.8rem', width: '140px',
            }}
          />
        </div>

        {/* Notification bell */}
        <button
          id="notif-btn"
          style={{
            width: '38px', height: '38px',
            background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
            borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
        >
          <Bell size={16} color="var(--text-secondary)" />
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '8px', height: '8px',
            background: '#7c3aed', borderRadius: '50%',
            border: '1.5px solid var(--bg-secondary)',
          }} />
        </button>

        {/* Avatar */}
        <div
          id="admin-avatar"
          style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          }}
        >
          <User size={17} color="#fff" />
        </div>
      </div>
    </header>
  )
}
