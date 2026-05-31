import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          }}>
            <Loader2 size={24} color="#fff" style={{ animation: 'spin-slow 0.9s linear infinite' }} />
          </div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Authenticating…
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
