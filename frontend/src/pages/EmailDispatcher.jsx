import { useState } from 'react'
import { Send, Mail, CheckCircle, Clock, Play, RotateCcw, Loader2 } from 'lucide-react'
import { useSalaryRecords } from '../hooks/useSalaryRecords'
import { useEmailDispatcher } from '../hooks/useEmailDispatcher'

const CURRENT_MONTH = new Date().toLocaleString('en-US', { month: 'long' })
const CURRENT_YEAR  = new Date().getFullYear()

export default function EmailDispatcher() {
  const { records, loading, refetch } = useSalaryRecords({ month: CURRENT_MONTH, year: CURRENT_YEAR })
  const { sendEmail, sendBulk, dispatching } = useEmailDispatcher()

  const [checked, setChecked]   = useState([])
  const [progress, setProgress] = useState(null)  // { current, total }

  const pending = records.filter(r => r.status !== 'Sent')
  const sent    = records.filter(r => r.status === 'Sent')

  const toggleCheck = (id) =>
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleSendAll = async () => {
    if (checked.length === 0) return
    setProgress({ current: 0, total: checked.length })
    await sendBulk(checked, ({ current, total }) => setProgress({ current, total }))
    setProgress(null)
    setChecked([])
    refetch()
  }

  const handleSendOne = async (id) => {
    await sendEmail(id)
    refetch()
  }

  const handleReset = () => {
    setChecked([])
    refetch()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="card animate-fade-in-up" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.07))', border: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Mail size={18} color="#a78bfa" />
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem' }}>Email Dispatcher</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
              Sends salary slips to employee emails via Supabase Edge Function + Resend API. Each email is personalised with the payment month and salary breakdown.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={handleReset} disabled={dispatching}><RotateCcw size={14} /> Refresh</button>
            <button id="dispatch-all-btn" className="btn-primary" onClick={handleSendAll} disabled={dispatching || checked.length === 0}>
              {dispatching
                ? <><Loader2 size={14} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> Dispatching…</>
                : <><Play size={14} /> Dispatch {checked.length} Emails</>}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {progress && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Sending {progress.current} of {progress.total}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${(progress.current / progress.total) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    value: records.length, color: '#a78bfa', icon: Mail },
            { label: 'Sent',     value: sent.length,    color: '#34d399', icon: CheckCircle },
            { label: 'Pending',  value: pending.length, color: '#fbbf24', icon: Clock },
            { label: 'Selected', value: checked.length, color: '#22d3ee', icon: Send },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <s.icon size={14} color={s.color} />
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...Array(4)].map((_,i) => <div key={i} className="shimmer-bg" style={{ height: '52px', borderRadius: '8px' }} />)}
        </div>
      ) : pending.length > 0 && (
        <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} color="#fbbf24" />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Pending Dispatch</span>
              <span className="badge badge-warning">{pending.length}</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox"
                checked={checked.length === pending.length && pending.length > 0}
                onChange={() => { if (checked.length === pending.length) setChecked([]); else setChecked(pending.map(r => r.id)) }}
                style={{ accentColor: '#7c3aed', width: '14px', height: '14px' }}
              />
              Select All
            </label>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Employee</th>
                  <th>Email Address</th>
                  <th style={{ textAlign: 'right' }}>Net Salary</th>
                  <th>Slip Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <input type="checkbox"
                        checked={checked.includes(r.id)}
                        onChange={() => toggleCheck(r.id)}
                        style={{ accentColor: '#7c3aed' }}
                        disabled={dispatching}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>
                          {r.employees?.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.employees?.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.emp_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{r.employees?.email}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#a78bfa', fontFamily: 'Space Grotesk, sans-serif' }}>
                      ₹{Number(r.net_salary).toLocaleString('en-IN')}
                    </td>
                    <td><span className={`badge ${r.status==='Generated'?'badge-purple':'badge-warning'}`}>{r.status}</span></td>
                    <td>
                      <button className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} disabled={dispatching}
                        onClick={() => handleSendOne(r.id)}>
                        <Send size={11} /> Send
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sent Table */}
      {!loading && sent.length > 0 && (
        <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={15} color="#10b981" />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Dispatched</span>
            <span className="badge badge-success">{sent.length}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Email</th><th style={{ textAlign: 'right' }}>Net Salary</th><th>Status</th></tr></thead>
              <tbody>
                {sent.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>
                          {r.employees?.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.employees?.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.emp_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{r.employees?.email}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#a78bfa', fontFamily: 'Space Grotesk, sans-serif' }}>
                      ₹{Number(r.net_salary).toLocaleString('en-IN')}
                    </td>
                    <td><span className="badge badge-success"><CheckCircle size={10} /> Sent</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Template Preview */}
      <div className="card animate-fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Mail size={16} color="#22d3ee" />
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>Email Template (send-email Edge Function)</h3>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div><strong style={{ color: '#a78bfa' }}>Subject:</strong> Salary Slip — {'{month}'} {'{year}'} | SalaryFlow</div>
          <div style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>To:</strong> <span style={{ color: '#22d3ee' }}>{'{employee.email}'}</span></div>
          <div>Dear <span style={{ color: '#34d399' }}>{'{employee.name}'}</span>,</div>
          <br />
          <div>Your salary slip for <span style={{ color: '#fbbf24' }}>{'{month} {year}'}</span> has been processed.</div>
          <div>Net salary: <span style={{ color: '#a78bfa' }}>₹{'{net_salary}'}</span></div>
          <br />
          <div>Regards,<br />HR Department • SalaryFlow</div>
        </div>
      </div>
    </div>
  )
}
