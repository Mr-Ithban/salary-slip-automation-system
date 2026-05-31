import { useState } from 'react'
import { FileText, Download, Eye, Search, Filter, Calendar, X, Loader2, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useSalaryRecords } from '../hooks/useSalaryRecords'
import { downloadPdf, downloadPdfWithPassword } from '../utils/generatePdf'
import toast from 'react-hot-toast'

const CURRENT_MONTH = new Date().toLocaleString('en-US', { month: 'long' })
const CURRENT_YEAR  = new Date().getFullYear()

const statusBadgeClass = { Sent: 'badge-success', Generated: 'badge-purple', Pending: 'badge-warning' }

// ── Salary Slip Modal ──────────────────────────────────────────────────────
const SlipModal = ({ rec, onClose, onDownload }) => {
  if (!rec) return null
  const emp = rec.employees
  const net = Number(rec.net_salary)
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '20px', width: '520px', maxWidth: '100%', animation: 'fadeInUp 0.25s ease', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '18px 18px 0 0', padding: '28px 28px 24px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>SALARY SLIP</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>{rec.month} {rec.year} • SalaryFlow</div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{emp?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{emp?.designation} • {emp?.department}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{rec.emp_id} • {emp?.email}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>NET SALARY</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                {fmt(net)}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>

          {/* Earnings */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Earnings</div>
            {[
              { label: 'Basic Salary', value: rec.base_salary },
              { label: 'HRA',          value: rec.hra         },
              { label: 'Allowances',   value: rec.allowances  },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>+{fmt(r.value)}</span>
              </div>
            ))}
          </div>

          {/* Deductions */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Deductions</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Deductions</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f87171' }}>-{fmt(rec.deductions)}</span>
            </div>
          </div>

          {/* Net */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px' }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>Net Salary</span>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>{fmt(net)}</span>
          </div>

          {/* Password hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px', padding: '10px 12px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}>
            <Lock size={13} color="#fbbf24" />
            <span style={{ fontSize: '0.74rem', color: '#fbbf24' }}>
              PDF password: <strong>{(emp?.name || '').split(' ')[0]}{emp?.dob ? new Date(emp.dob).getFullYear() : '????'}</strong> (first name + birth year)
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => { onClose(); onDownload(rec) }}>
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Password Modal ─────────────────────────────────────────────────────────
const PasswordModal = ({ rec, onClose, onConfirm }) => {
  const [pwd, setPwd]     = useState('')
  const [err, setErr]     = useState('')
  const [show, setShow]   = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = onConfirm(rec, pwd)
    if (!result.ok) {
      setErr(`Wrong password. Hint: first name + birth year (e.g. ${result.expected ? result.expected.replace(/\d/g, '*') : 'John1990'})`)
      setPwd('')
    } else {
      onClose()
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '16px', width: '380px', maxWidth: '100%', padding: '28px', animation: 'fadeInUp 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={17} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem' }}>Protected PDF</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>Enter the PDF password to download</div>
          </div>
        </div>

        {err && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '14px' }}>
            <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '0.78rem', color: '#f87171' }}>{err}</span>
          </div>
        )}

        <div style={{ marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Format: <strong style={{ color: '#a78bfa' }}>FirstName + BirthYear</strong> e.g. <code style={{ color: '#22d3ee' }}>Arjun1990</code>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              className="input-field"
              placeholder="e.g. Arjun1990"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setErr('') }}
              autoFocus
              required
            />
            <button type="button" onClick={() => setShow(p => !p)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              <Download size={13} /> Download
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SalarySlips() {
  const { records, loading } = useSalaryRecords({ month: CURRENT_MONTH, year: CURRENT_YEAR })
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('All')
  const [selected, setSelected] = useState(null)        // slip modal
  const [pwdTarget, setPwdTarget] = useState(null)      // password modal

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = r.employees?.name.toLowerCase().includes(q) || r.emp_id.toLowerCase().includes(q)
    const matchStatus = status === 'All' || r.status === status
    return matchSearch && matchStatus
  })

  const openDownload = (rec) => {
    handleDirectDownload(rec)
  }

  const handlePasswordConfirm = (rec, pwd) => {
    const result = downloadPdfWithPassword(rec, pwd)
    if (result.ok) {
      toast.success('PDF downloaded!')
    } else {
      toast.error('Incorrect password')
    }
    return result
  }

  const handleDirectDownload = (rec) => {
    downloadPdf(rec)
    toast.success('PDF downloaded!')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {selected   && <SlipModal    rec={selected}   onClose={() => setSelected(null)}   onDownload={openDownload} />}
      {pwdTarget  && <PasswordModal rec={pwdTarget}  onClose={() => setPwdTarget(null)}  onConfirm={handlePasswordConfirm} />}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '10px', padding: '9px 14px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input type="text" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Filter size={14} color="var(--text-muted)" />
          {['All', 'Sent', 'Generated', 'Pending'].map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '0.78rem',
              fontWeight: status === s ? 700 : 500, cursor: 'pointer',
              background: status === s ? 'rgba(124,58,237,0.2)' : 'var(--bg-card)',
              color: status === s ? '#a78bfa' : 'var(--text-secondary)',
              border: `1px solid ${status === s ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <Calendar size={13} />{CURRENT_MONTH} {CURRENT_YEAR}
        </div>
      </div>

      {/* Password protection notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <Lock size={14} color="#a78bfa" />
        Emailed PDF slips are strictly password-protected. Password format: <strong style={{ color: '#a78bfa' }}>FirstName + BirthYear</strong> (e.g. <code>Arjun1990</code>)
      </div>

      {/* Table */}
      <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>
            <FileText size={15} style={{ display: 'inline', marginRight: '6px', color: '#a78bfa', verticalAlign: 'middle' }} />
            Salary Slips
          </div>
          {loading
            ? <Loader2 size={16} color="var(--text-muted)" style={{ animation: 'spin-slow 0.9s linear infinite' }} />
            : <span className="badge badge-info">{filtered.length} records</span>}
        </div>

        {loading ? (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...Array(5)].map((_,i) => <div key={i} className="shimmer-bg" style={{ height: '48px', borderRadius: '8px' }} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th style={{ textAlign: 'right' }}>Base</th>
                  <th style={{ textAlign: 'right' }}>HRA</th>
                  <th style={{ textAlign: 'right' }}>Allow.</th>
                  <th style={{ textAlign: 'right' }}>Deduct.</th>
                  <th style={{ textAlign: 'right' }}>Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>
                          {r.employees?.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.employees?.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info" style={{ fontSize: '0.62rem' }}>{r.emp_id}</span></td>
                    <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>₹{(r.base_salary/1000).toFixed(0)}K</td>
                    <td style={{ textAlign: 'right', fontSize: '0.8rem', color: '#34d399' }}>₹{(r.hra/1000).toFixed(0)}K</td>
                    <td style={{ textAlign: 'right', fontSize: '0.8rem', color: '#22d3ee' }}>₹{(r.allowances/1000).toFixed(0)}K</td>
                    <td style={{ textAlign: 'right', fontSize: '0.8rem', color: '#f87171' }}>-₹{(r.deductions/1000).toFixed(0)}K</td>
                    <td style={{ textAlign: 'right', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#a78bfa', whiteSpace: 'nowrap' }}>
                      ₹{Number(r.net_salary).toLocaleString('en-IN')}
                    </td>
                    <td><span className={`badge ${statusBadgeClass[r.status]}`}>{r.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {/* View */}
                        <button title="View slip" onClick={() => setSelected(r)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-bright)', background: 'var(--bg-secondary)', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='#7c3aed'; e.currentTarget.style.background='rgba(124,58,237,0.15)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.background='var(--bg-secondary)' }}>
                          <Eye size={12} />
                        </button>
                        {/* Direct download */}
                        <button title="Download PDF" onClick={() => handleDirectDownload(r)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-bright)', background: 'var(--bg-secondary)', cursor: 'pointer', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='#10b981'; e.currentTarget.style.background='rgba(16,185,129,0.15)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.background='var(--bg-secondary)' }}>
                          <Download size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No salary records for {CURRENT_MONTH} {CURRENT_YEAR}. Upload payroll data first.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
