import { useState } from 'react'
import { Send, Mail, CheckCircle, Clock, AlertCircle, Play, RotateCcw } from 'lucide-react'
import { employees, salaryData, getNetSalary } from '../data/mockData'
import toast from 'react-hot-toast'

export default function EmailDispatcher() {
  const [sending, setSending] = useState(false)
  const [sentIds, setSentIds] = useState(
    salaryData.filter(s => s.status === 'Sent').map(s => s.employeeId)
  )
  const [selectedAll, setSelectedAll] = useState(false)
  const [checked, setChecked] = useState(
    salaryData.filter(s => s.status !== 'Sent').map(s => s.employeeId)
  )

  const enriched = salaryData.map(s => ({
    ...s,
    employee: employees.find(e => e.id === s.employeeId),
    net: getNetSalary(s),
    alreadySent: sentIds.includes(s.employeeId),
  }))

  const pending = enriched.filter(r => !r.alreadySent)
  const sent    = enriched.filter(r =>  r.alreadySent)

  const toggleCheck = (id) => {
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSendAll = () => {
    if (checked.length === 0) { toast.error('No employees selected!'); return }
    setSending(true)
    let idx = 0
    const ids = [...checked]
    const iv = setInterval(() => {
      if (idx >= ids.length) {
        clearInterval(iv)
        setSentIds(prev => [...new Set([...prev, ...ids])])
        setSending(false)
        setChecked([])
        toast.success(`${ids.length} emails dispatched successfully!`)
        return
      }
      setSentIds(prev => [...prev, ids[idx]])
      idx++
    }, 500)
  }

  const handleReset = () => {
    setSentIds([])
    setChecked(salaryData.map(s => s.employeeId))
    toast('All statuses reset')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Email Config Card */}
      <div className="card animate-fade-in-up" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.07))',
        border: '1px solid rgba(124,58,237,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Mail size={18} color="#a78bfa" />
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem' }}>
                Email Dispatcher
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
              Send salary slips as PDF attachments to employee emails. Each email is personalized with the employee's name and payment month.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={handleReset} disabled={sending}>
              <RotateCcw size={14} /> Reset
            </button>
            <button
              id="dispatch-all-btn"
              className="btn-primary"
              onClick={handleSendAll}
              disabled={sending || checked.length === 0}
            >
              {sending
                ? <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} /> Dispatching…</>
                : <><Play size={14} /> Dispatch {checked.length} Emails</>
              }
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: enriched.length, color: '#a78bfa', icon: Mail },
            { label: 'Sent', value: sent.length, color: '#34d399', icon: CheckCircle },
            { label: 'Pending', value: pending.length, color: '#fbbf24', icon: Clock },
            { label: 'Selected', value: checked.length, color: '#22d3ee', icon: Send },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: '10px',
            }}>
              <s.icon size={14} color={s.color} />
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Table */}
      {pending.length > 0 && (
        <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} color="#fbbf24" />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Pending Dispatch</span>
              <span className="badge badge-warning">{pending.length}</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checked.length === pending.length}
                onChange={() => {
                  if (checked.length === pending.length) setChecked([])
                  else setChecked(pending.map(r => r.employeeId))
                }}
                style={{ accentColor: '#7c3aed', width: '14px', height: '14px' }}
              />
              Select All
            </label>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox"
                      checked={checked.length === pending.length && pending.length > 0}
                      onChange={() => { if (checked.length === pending.length) setChecked([]); else setChecked(pending.map(r => r.employeeId)) }}
                      style={{ accentColor: '#7c3aed' }}
                    />
                  </th>
                  <th>Employee</th>
                  <th>Email Address</th>
                  <th>Net Salary</th>
                  <th>Slip Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r, i) => {
                  const isSending = sending && sentIds.includes(r.employeeId)
                  return (
                    <tr key={i} style={{ opacity: isSending ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checked.includes(r.employeeId)}
                          onChange={() => toggleCheck(r.employeeId)}
                          style={{ accentColor: '#7c3aed' }}
                          disabled={sending}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 800, color: '#fff',
                          }}>
                            {r.employee?.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.employee?.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{r.employee?.email}</td>
                      <td style={{ fontWeight: 700, color: '#a78bfa', fontFamily: 'Space Grotesk, sans-serif' }}>
                        ₹{r.net.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${r.status === 'Generated' ? 'badge-purple' : 'badge-warning'}`}>{r.status}</span>
                      </td>
                      <td>
                        <button
                          className="btn-primary"
                          style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          disabled={sending}
                          onClick={() => {
                            setSentIds(prev => [...prev, r.employeeId])
                            setChecked(prev => prev.filter(x => x !== r.employeeId))
                            toast.success(`Email sent to ${r.employee?.name}!`)
                          }}
                        >
                          <Send size={11} /> Send
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sent Table */}
      {sent.length > 0 && (
        <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={15} color="#10b981" />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Dispatched</span>
            <span className="badge badge-success">{sent.length}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email Address</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sent.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'linear-gradient(135deg, #059669, #047857)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 800, color: '#fff',
                        }}>
                          {r.employee?.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.employee?.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{r.employee?.email}</td>
                    <td style={{ fontWeight: 700, color: '#a78bfa', fontFamily: 'Space Grotesk, sans-serif' }}>
                      ₹{r.net.toLocaleString('en-IN')}
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
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>
            Email Template Preview
          </h3>
        </div>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', fontFamily: 'monospace', fontSize: '0.8rem',
          color: 'var(--text-secondary)', lineHeight: 1.8,
        }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
            <strong style={{ color: '#a78bfa' }}>Subject:</strong> Salary Slip — May 2026 | SalaryFlow
          </div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
            <strong style={{ color: '#a78bfa' }}>To:</strong> <span style={{ color: '#22d3ee' }}>{'{employee.email}'}</span>
          </div>
          <div>Dear <span style={{ color: '#34d399' }}>{'{employee.name}'}</span>,</div>
          <br />
          <div>Please find attached your salary slip for the month of <span style={{ color: '#fbbf24' }}>{'{month} {year}'}</span>.</div>
          <br />
          <div>Your net salary of <span style={{ color: '#a78bfa' }}>₹{'{net_salary}'}</span> has been processed.</div>
          <br />
          <div>Regards,<br />HR Department • SalaryFlow</div>
        </div>
      </div>
    </div>
  )
}
