import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, Eye, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { getNetSalary } from '../data/mockData'

const REQUIRED_HEADERS = ['Employee ID', 'Base Salary', 'HRA', 'Allowances', 'Deductions', 'Month', 'Year']

const statusBadge = (s) => {
  const map = { valid: 'badge-success', warn: 'badge-warning', error: 'badge-danger' }
  return <span className={`badge ${map[s]}`}>{s === 'valid' ? '✓ Valid' : s === 'warn' ? '⚠ Warning' : '✕ Error'}</span>
}

export default function UploadPortal() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile]         = useState(null)
  const [rows, setRows]         = useState([])
  const [headers, setHeaders]   = useState([])
  const [step, setStep]         = useState('idle') // idle | preview | processing | done
  const [progress, setProgress] = useState(0)
  const fileRef = useRef()

  const parseFile = (f) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 })
        const h = json[0]
        const r = json.slice(1).filter(row => row.some(Boolean)).map(row => {
          const obj = {}
          h.forEach((k, i) => { obj[k] = row[i] })
          const net = (Number(obj['Base Salary'] || 0) + Number(obj.HRA || 0) + Number(obj.Allowances || 0)) - Number(obj.Deductions || 0)
          obj._net = net
          obj._status = net > 0 ? 'valid' : 'error'
          return obj
        })
        setHeaders(h)
        setRows(r)
        setStep('preview')
        toast.success(`Parsed ${r.length} salary records`)
      } catch {
        toast.error('Failed to parse file. Use CSV or Excel.')
      }
    }
    reader.readAsArrayBuffer(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (!f) return
    setFile(f)
    parseFile(f)
  }

  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    parseFile(f)
  }

  const handleProcess = () => {
    setStep('processing')
    setProgress(0)
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 18
      if (p >= 100) { p = 100; clearInterval(iv); setStep('done'); toast.success('All salary slips generated!') }
      setProgress(Math.min(p, 100))
    }, 200)
  }

  const handleReset = () => {
    setFile(null); setRows([]); setHeaders([]); setStep('idle'); setProgress(0)
  }

  const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {['Upload File', 'Preview Data', 'Generate Slips'].map((s, i) => {
          const active = (step === 'idle' && i === 0) || (step === 'preview' && i === 1) || ((step === 'processing' || step === 'done') && i === 2)
          const done = (step !== 'idle' && i === 0) || ((step === 'processing' || step === 'done') && i === 1)
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: done ? '#10b981' : active ? '#7c3aed' : 'var(--bg-card)',
                  border: `1px solid ${done ? '#10b981' : active ? '#7c3aed' : 'var(--border-bright)'}`,
                  color: (done || active) ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {done ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.825rem', fontWeight: active || done ? 600 : 400, color: active ? '#a78bfa' : done ? '#34d399' : 'var(--text-muted)' }}>
                  {s}
                </span>
              </div>
              {i < 2 && <div style={{ width: '50px', height: '1px', background: done ? '#10b981' : 'var(--border)', margin: '0 12px', transition: 'background 0.3s' }} />}
            </div>
          )
        })}
      </div>

      {/* Upload Zone */}
      {step === 'idle' && (
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''} animate-fade-in-up`}
          style={{ padding: '64px 32px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileSelect} />
          <div style={{
            width: '72px', height: '72px', margin: '0 auto 20px',
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Upload size={32} color="#a78bfa" />
          </div>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
            Drop your payroll file here
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Supports <strong style={{ color: 'var(--text-secondary)' }}>CSV</strong> and <strong style={{ color: 'var(--text-secondary)' }}>Excel (.xlsx/.xls)</strong> formats
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {REQUIRED_HEADERS.map(h => (
              <span key={h} className="badge badge-purple">{h}</span>
            ))}
          </div>
          <p style={{ marginTop: '24px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            or <span style={{ color: '#a78bfa', textDecoration: 'underline' }}>browse files</span>
          </p>
        </div>
      )}

      {/* Preview Table */}
      {step === 'preview' && (
        <div className="animate-fade-in-up">
          {/* File info bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '16px',
          }}>
            <FileSpreadsheet size={20} color="#34d399" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{file?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {rows.length} records • {(file?.size / 1024).toFixed(1)} KB
              </div>
            </div>
            {missingHeaders.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.75rem' }}>
                <AlertTriangle size={14} /> Missing: {missingHeaders.join(', ')}
              </div>
            )}
            <button className="btn-secondary" onClick={handleReset} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <X size={13} /> Replace
            </button>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>
                <Eye size={15} style={{ display: 'inline', marginRight: '6px', color: '#a78bfa', verticalAlign: 'middle' }} />
                Data Preview
              </div>
              <span className="badge badge-info">{rows.length} records</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {headers.map(h => <th key={h}>{h}</th>)}
                    <th>Net Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {headers.map(h => (
                        <td key={h}>
                          {typeof row[h] === 'number' && h !== 'Year'
                            ? `₹${Number(row[h]).toLocaleString('en-IN')}`
                            : row[h] ?? '—'}
                        </td>
                      ))}
                      <td style={{ fontWeight: 700, color: '#34d399' }}>₹{Number(row._net).toLocaleString('en-IN')}</td>
                      <td>{statusBadge(row._status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button className="btn-secondary" onClick={handleReset}>Cancel</button>
            <button className="btn-primary" onClick={handleProcess} disabled={missingHeaders.length > 0}>
              Generate Salary Slips <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Processing */}
      {(step === 'processing' || step === 'done') && (
        <div className="card animate-fade-in-up" style={{ textAlign: 'center', padding: '48px 32px' }}>
          {step === 'processing' ? (
            <>
              <div style={{
                width: '72px', height: '72px', margin: '0 auto 24px',
                border: '3px solid var(--border-bright)',
                borderTop: '3px solid #7c3aed',
                borderRadius: '50%',
                animation: 'spin-slow 0.9s linear infinite',
              }} />
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                Generating Salary Slips…
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                Processing {rows.length} records
              </p>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden', maxWidth: '400px', margin: '0 auto' }}>
                <div style={{
                  height: '100%', borderRadius: '999px',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                  transition: 'width 0.2s ease',
                  boxShadow: '0 0 12px rgba(124,58,237,0.5)',
                }} />
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.875rem', fontWeight: 700, color: '#a78bfa' }}>{Math.round(progress)}%</div>
            </>
          ) : (
            <>
              <div style={{
                width: '72px', height: '72px', margin: '0 auto 20px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={36} color="#10b981" />
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                Salary Slips Generated!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                {rows.length} PDF slips are ready to dispatch
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button className="btn-secondary" onClick={handleReset}>
                  <RefreshCw size={14} /> New Upload
                </button>
                <button className="btn-success">
                  <ArrowRight size={14} /> Go to Email Dispatcher
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      {step === 'idle' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '📋', title: 'Required Columns', desc: 'Your file must contain Employee ID, Base Salary, HRA, Allowances, Deductions, Month, Year.' },
            { icon: '🧮', title: 'Auto Calculation', desc: 'Net Salary = (Base + HRA + Allowances) − Deductions. Calculated automatically.' },
            { icon: '📧', title: 'Ready for Email', desc: 'After generating, slips go to the Email Dispatcher to be sent to each employee.' },
          ].map(c => (
            <div key={c.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '1.5rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
