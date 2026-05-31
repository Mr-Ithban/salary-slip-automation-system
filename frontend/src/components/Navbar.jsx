import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, User, LogOut, ChevronDown, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const pageLabels = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload Payroll',
  '/employees': 'Employee Management',
  '/slips':     'Salary Slips',
  '/email':     'Email Dispatcher',
  '/settings':  'Settings',
}

export default function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, signOut } = useAuth()
  const label     = pageLabels[location.pathname] || 'SalaryFlow'

  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ emps: [], slips: [] })
  const [notifs, setNotifs] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const menuRef = useRef(null)
  const notifRef = useRef(null)
  const searchRef = useRef(null)

  // Fetch real-time notifications (email logs) on mount and live subscription
  useEffect(() => {
    async function loadNotifications() {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*, employees(name, emp_id)')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (!error && data) {
        setNotifs(data)
        // Count failed dispatches as needing attention
        setUnreadCount(data.filter(n => n.status === 'Failed').length)
      }
    }
    loadNotifications()

    // Subscribe to new email logs in real-time
    const sub = supabase
      .channel('live-email-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'email_logs' }, () => {
        loadNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  // Live Global Search handler
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ emps: [], slips: [] })
      return
    }

    const delayDebounce = setTimeout(async () => {
      // Search matching Employees
      const { data: emps } = await supabase
        .from('employees')
        .select('id, name, emp_id, designation')
        .or(`name.ilike.%${searchQuery}%,emp_id.ilike.%${searchQuery}%`)
        .limit(3)

      // Search matching Salary Records
      const { data: slips } = await supabase
        .from('salary_records')
        .select('id, month, year, emp_id, employees(name)')
        .or(`month.ilike.%${searchQuery}%,emp_id.ilike.%${searchQuery}%`)
        .limit(3)

      setSearchResults({ emps: emps || [], slips: slips || [] })
    }, 200)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults({ emps: [], slips: [] })
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut()
    toast.success('Logged out successfully')
    navigate('/login', { replace: true })
  }

  const userEmail   = user?.email || ''
  const userInitial = userEmail.slice(0, 1).toUpperCase() || 'A'

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
        padding: '0 24px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Global Search Component */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
            borderRadius: '10px', padding: '8px 14px',
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '0.8rem', width: '130px',
              }}
            />
          </div>

          {/* Search Dropdown Panel */}
          {(searchResults.emps.length > 0 || searchResults.slips.length > 0) && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
              borderRadius: '12px', padding: '10px', minWidth: '280px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 50,
              animation: 'fadeInUp 0.15s ease',
            }}>
              {searchResults.emps.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Employees</div>
                  {searchResults.emps.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => { navigate('/employees'); setSearchQuery(''); setSearchResults({ emps: [], slips: [] }) }}
                      style={{ padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px', transition: 'background 0.15s' }}
                      className="search-item"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{emp.emp_id} • {emp.designation}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.slips.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Salary Slips</div>
                  {searchResults.slips.map(slip => (
                    <div
                      key={slip.id}
                      onClick={() => { navigate('/slips'); setSearchQuery(''); setSearchResults({ emps: [], slips: [] }) }}
                      style={{ padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px', transition: 'background 0.15s' }}
                      className="search-item"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{slip.employees?.name}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Slip ID: {slip.emp_id} • {slip.month} {slip.year}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Notifications Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            id="notif-btn"
            onClick={() => { setNotifOpen(p => !p); setUnreadCount(0) }}
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
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '8px', height: '8px',
                background: '#EF4444', borderRadius: '50%',
                border: '1.5px solid var(--bg-secondary)',
              }} />
            )}
          </button>

          {/* Floating Notifications Panel */}
          {notifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
              borderRadius: '12px', padding: '10px', minWidth: '320px', maxWidth: '360px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 50,
              animation: 'fadeInUp 0.15s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Email Logs / Notifications</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Real-time</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    No recent activity logs.
                  </div>
                ) : (
                  notifs.map(n => (
                    <div key={n.id} style={{ display: 'flex', gap: '8px', padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ marginTop: '2px' }}>
                        {n.status === 'Sent' ? (
                          <CheckCircle2 size={14} color="#10B981" />
                        ) : (
                          <XCircle size={14} color="#EF4444" />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {n.status === 'Sent' ? 'Slip Emailed' : 'Dispatch Failed'}
                        </span>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.2' }}>
                          {n.status === 'Sent' 
                            ? `Salary slip successfully delivered to ${n.employees?.name || n.recipient_email}.`
                            : `Could not send to ${n.employees?.name || n.recipient_email}. Tap settings to verify config.`
                          }
                        </p>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '6px', textAlign: 'center' }}>
                <button 
                  onClick={() => { navigate('/slips'); setNotifOpen(false) }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  View all slips <ArrowRight size={10} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            id="admin-avatar"
            onClick={() => setMenuOpen(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px',
              background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
          >
            <div style={{
              width: '28px', height: '28px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '0.75rem', color: '#fff',
            }}>
              {userInitial}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </span>
            <ChevronDown size={13} color="var(--text-muted)" style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
              borderRadius: '12px', padding: '6px', minWidth: '180px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)', zIndex: 50,
              animation: 'fadeInUp 0.15s ease',
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Signed in as</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
                <span className="badge badge-purple" style={{ marginTop: '4px', fontSize: '0.6rem' }}>Admin</span>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: 'transparent', color: '#f87171', fontSize: '0.825rem', fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
