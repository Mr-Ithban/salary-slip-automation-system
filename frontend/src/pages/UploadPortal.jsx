import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, Eye, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'

const REQUIRED_COLS = ['Employee ID', 'Base Salary', 'HRA', 'Allowances', 'Deductions', 'Month', 'Year']
const VALID_MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const ALLOWED_EXTS  = ['.csv', '.xlsx', '.xls']

// ── Validation ──────────────────────────────────────────────────────────────
function validateRow(row, i, empIds) {
  const errors = []

  // Required fields present
  if (!row['Employee ID'])  errors.push('Missing Employee ID')
  if (!row['Month'])        errors.push('Missing Month')
  if (!row['Year'])         errors.push('Missing Year')

  // Numeric fields
  ;['Base Salary','HRA','Allowances','Deductions'].forEach(f => {
    const v = row[f]
    if (v === undefined || v === '' || v === null) { errors.push(`${f} is empty`); return }
    if (isNaN(Number(v))) errors.push(`${f} must be a number (got "${v}")`)
    else if (Number(v) < 0) errors.push(`${f} cannot be negative`)
  })

  // Month valid
  if (row['Month'] && !VALID_MONTHS.includes(row['Month'])) {
    errors.push(`Invalid month "${row['Month']}" — use full English name`)
  }

  // Year valid
  if (row['Year']) {
    const y = Number(row['Year'])
    if (isNaN(y) || y < 2000 || y > 2100) errors.push(`Invalid year ${row['Year']}`)
  }

  // Net salary must be positive
  const net = (Number(row['Base Salary']||0) + Number(row['HRA']||0) + Number(row['Allowances']||0)) - Number(row['Deductions']||0)
  if (!isNaN(net) && net <= 0) errors.push(`Net salary is ₹${net} — check deductions`)

  return errors
}

// Check for duplicate Employee IDs within the upload
function findDuplicates(rows) {
  const seen = {}
  const dups  = new Set()
  rows.forEach((r, i) => {
    const key = `${r['Employee ID']}|${r['Month']}|${r['Year']}`
    if (seen[key] !== undefined) { dups.add(i); dups.add(seen[key]) }
    else seen[key] = i
  })
  return dups
}

const statusBadge = (status) => {
  const map = { valid: 'badge-success', warn: 'badge-warning', error: 'badge-danger' }
  const labels = { valid: '✓ Valid', warn: '⚠ Warning', error: '✕ Error' }
  return <span className={`badge ${map[status] || 'badge-warning'}`}>{labels[status] || status}</span>
}

export default function UploadPortal() {
  const [dragOver, setDragOver]     = useState(false)
  const [file, setFile]             = useState(null)
  const [rows, setRows]             = useState([])
  const [headers, setHeaders]       = useState([])
  const [rowErrors, setRowErrors]   = useState([])   // array of { row, errors, isDuplicate }
  const [globalErrors, setGlobalErrors] = useState([])
  const [step, setStep]             = useState('idle')
  const [progress, setProgress]     = useState(0)
  const [processLog, setProcessLog] = useState({ created: 0, errors: [] })
  const fileRef = useRef()

  const parseFile = (f) => {
    // Check extension
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) {
      toast.error(`Unsupported file type: ${ext}. Use CSV or Excel (.xlsx/.xls)`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array', cellDates: true })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        if (!json || json.length < 2) {
          toast.error('File is empty or has only a header row')
          return
        }

        const h = json[0].map(String)
        const dataRows = json.slice(1).filter(row => row.some(v => v !== '' && v !== null && v !== undefined))

        if (dataRows.length === 0) {
          toast.error('No data rows found after the header')
          return
        }

        // Build objects
        const objects = dataRows.map(row => {
          const obj = {}
          h.forEach((k, i) => {
            let v = row[i]
            if (v instanceof Date) v = VALID_MONTHS[v.getMonth()]  // Excel date for month column
            obj[k] = v === undefined ? '' : v
          })
          obj._net = (Number(obj['Base Salary']||0) + Number(obj['HRA']||0) + Number(obj['Allowances']||0)) - Number(obj['Deductions']||0)
          return obj
        })

        // Global validation — check required columns
        const gErrors = []
        const missingCols = REQUIRED_COLS.filter(c => !h.includes(c))
        if (missingCols.length > 0) {
          gErrors.push(`Missing required columns: ${missingCols.join(', ')}`)
        }

        // Per-row validation
        const dups = findDuplicates(objects)
        const rErrors = objects.map((row, i) => {
          const errs = validateRow(row, i, [])
          const isDuplicate = dups.has(i)
          if (isDuplicate) errs.push('Duplicate Employee ID + Month + Year in this upload')
          return { row: i, errors: errs, isDuplicate }
        })

        // Set status on each row
        objects.forEach((obj, i) => {
          const e = rErrors[i]
          obj._status = e.errors.length > 0 ? 'error' : 'valid'
        })

        setHeaders(h)
        setRows(objects)
        setRowErrors(rErrors)
        setGlobalErrors(gErrors)
        setStep('preview')

        const errorCount = rErrors.filter(e => e.errors.length > 0).length
        if (errorCount > 0) {
          toast.error(`${errorCount} row(s) have validation errors — fix before processing`)
        } else if (gErrors.length > 0) {
          toast.error(gErrors[0])
        } else {
          toast.success(`Parsed ${objects.length} records — all valid`)
        }
      } catch (err) {
        toast.error(`Parse failed: ${err.message}`)
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
    e.target.value = ''
  }

  const handleProcess = async () => {
    const hasErrors = rowErrors.some(e => e.errors.length > 0) || globalErrors.length > 0
    if (hasErrors) {
      toast.error('Fix all validation errors before processing')
      return
    }

    setStep('processing')
    setProgress(0)

    const records = rows.map(row => ({
      empId:      String(row['Employee ID']),
      baseSalary: Number(row['Base Salary']),
      hra:        Number(row['HRA']),
      allowances: Number(row['Allowances']),
      deductions: Number(row['Deductions']),
      month:      String(row['Month']),
      year:       Number(row['Year']),
    }))

    // Fake progress while waiting
    let p = 0
    const tick = setInterval(() => {
      p = Math.min(p + 10, 85)
      setProgress(p)
    }, 200)

    try {
      // 1. Try calling the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('process-payroll', {
        body: { records },
      })

      if (error) throw new Error(error.message)

      clearInterval(tick)
      setProgress(100)
      setProcessLog({ created: data.created, errors: data.errors || [] })
      setStep('done')
      toast.success(`${data.created} salary slips saved to Supabase via Edge Function!`)
    } catch (err) {
      console.warn('Edge Function not deployed or failed. Falling back to direct database insertion:', err.message)
      toast('Using direct database fallback...', { icon: '☁️' })

      // 2. Client-Side Fallback: Loop and direct insert
      try {
        const results = { created: 0, errors: [] }
        let index = 0

        for (const row of records) {
          const { empId, baseSalary, hra, allowances, deductions, month, year } = row

          // Lookup employee
          const { data: emp, error: empErr } = await supabase
            .from('employees')
            .select('id, emp_id')
            .eq('emp_id', empId)
            .single()

          if (empErr || !emp) {
            results.errors.push(`Employee ${empId} not found`)
            index++
            setProgress(Math.min((index / records.length) * 100, 95))
            continue
          }

          // Upsert record
          const { error: upsertErr } = await supabase
            .from('salary_records')
            .upsert({
              employee_id: emp.id,
              emp_id: emp.emp_id,
              base_salary: Number(baseSalary),
              hra: Number(hra),
              allowances: Number(allowances),
              deductions: Number(deductions),
              month: String(month),
              year: Number(year),
              status: 'Generated',
            }, { onConflict: 'emp_id,month,year' })

          if (upsertErr) {
            results.errors.push(`Error saving ${empId}: ${upsertErr.message}`)
          } else {
            results.created++
          }

          index++
          setProgress(Math.min((index / records.length) * 100, 95))
        }

        clearInterval(tick)
        setProgress(100)
        setProcessLog(results)
        setStep('done')
        toast.success(`${results.created} salary slips saved to Supabase directly!`)
      } catch (fallbackErr) {
        clearInterval(tick)
        setProgress(0)
        setStep('preview')
        toast.error(`Processing failed: ${fallbackErr.message}`)
      }
    }
  }

  const handleReset = () => {
    setFile(null); setRows([]); setHeaders([]); setStep('idle')
    setProgress(0); setProcessLog({ created: 0, errors: [] })
    setGlobalErrors([]); setRowErrors([])
  }

  const validCount   = rows.filter(r => r._status === 'valid').length
  const errorCount   = rows.filter(r => r._status === 'error').length
  const missingCols  = REQUIRED_COLS.filter(c => !headers.includes(c))
  const canProcess   = globalErrors.length === 0 && errorCount === 0 && rows.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {['Upload File', 'Validate Data', 'Save to Database'].map((s, i) => {
          const active = (step==='idle'&&i===0)||(step==='preview'&&i===1)||((step==='processing'||step==='done')&&i===2)
          const done   = (step!=='idle'&&i===0)||((step==='processing'||step==='done')&&i===1)
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: done ? '#10b981' : active ? '#7c3aed' : 'var(--bg-card)',
                  border: `1px solid ${done ? '#10b981' : active ? '#7c3aed' : 'var(--border-bright)'}`,
                  color: (done||active) ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {done ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.825rem', fontWeight: active||done ? 600 : 400, color: active ? '#a78bfa' : done ? '#34d399' : 'var(--text-muted)' }}>
                  {s}
                </span>
              </div>
              {i < 2 && <div style={{ width: '40px', height: '1px', background: done ? '#10b981' : 'var(--border)', margin: '0 10px', transition: 'background 0.3s' }} />}
            </div>
          )
        })}
      </div>

      {/* Drop Zone */}
      {step === 'idle' && (
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''} animate-fade-in-up`}
          style={{ padding: '64px 32px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileSelect} />
          <div style={{ width: '72px', height: '72px', margin: '0 auto 20px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Upload size={32} color="#a78bfa" />
          </div>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Drop your payroll file here</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>Supports <strong style={{ color: 'var(--text-secondary)' }}>CSV</strong> and <strong style={{ color: 'var(--text-secondary)' }}>Excel (.xlsx/.xls)</strong></p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {REQUIRED_COLS.map(h => <span key={h} className="badge badge-purple">{h}</span>)}
          </div>
          <p style={{ marginTop: '24px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>or <span style={{ color: '#a78bfa', textDecoration: 'underline' }}>browse files</span></p>
        </div>
      )}

      {/* Preview & Validation */}
      {step === 'preview' && (
        <div className="animate-fade-in-up">

          {/* File info bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-card)', border: `1px solid ${errorCount > 0 || globalErrors.length > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '12px', marginBottom: '16px' }}>
            <FileSpreadsheet size={20} color={errorCount > 0 || globalErrors.length > 0 ? '#f87171' : '#34d399'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{file?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {rows.length} rows • {validCount} valid • {errorCount} errors • {(file?.size/1024).toFixed(1)} KB
              </div>
            </div>
            <button className="btn-secondary" onClick={handleReset} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <X size={13} /> Replace
            </button>
          </div>

          {/* Global errors */}
          {(globalErrors.length > 0 || missingCols.length > 0) && (
            <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#f87171', fontSize: '0.85rem', marginBottom: '8px' }}>
                <AlertCircle size={14} /> Schema Errors
              </div>
              {globalErrors.map((e, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {e}</div>)}
              {missingCols.length > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Missing columns: {missingCols.join(', ')}</div>}
            </div>
          )}

          {/* Data preview table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Eye size={15} color="#a78bfa" />
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Data Preview & Validation</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-success">{validCount} valid</span>
                {errorCount > 0 && <span className="badge badge-danger">{errorCount} errors</span>}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    {headers.map(h => <th key={h}>{h}</th>)}
                    <th style={{ textAlign: 'right' }}>Net Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const errs = rowErrors[i]?.errors || []
                    const hasErr = errs.length > 0
                    return (
                      <tr key={i} style={hasErr ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{i + 1}</td>
                        {headers.map(h => (
                          <td key={h} style={{ fontSize: '0.82rem' }}>
                            {typeof row[h] === 'number' && h !== 'Year'
                              ? `₹${Number(row[h]).toLocaleString('en-IN')}` : (row[h] ?? '—')}
                          </td>
                        ))}
                        <td style={{ textAlign: 'right', fontWeight: 700, color: row._net > 0 ? '#34d399' : '#f87171', fontSize: '0.82rem' }}>
                          ₹{Number(row._net).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <div>
                            {statusBadge(row._status)}
                            {hasErr && (
                              <div style={{ marginTop: '4px' }}>
                                {errs.map((e, j) => (
                                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#f87171', whiteSpace: 'nowrap' }}>
                                    <AlertCircle size={9} /> {e}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button className="btn-secondary" onClick={handleReset}>Cancel</button>
            <button className="btn-primary" onClick={handleProcess} disabled={!canProcess} style={{ opacity: canProcess ? 1 : 0.5, cursor: canProcess ? 'pointer' : 'not-allowed' }}>
              {canProcess ? <><ArrowRight size={14} /> Save {validCount} Records to Supabase</> : `Fix ${errorCount} error(s) first`}
            </button>
          </div>
        </div>
      )}

      {/* Processing / Done */}
      {(step === 'processing' || step === 'done') && (
        <div className="card animate-fade-in-up" style={{ textAlign: 'center', padding: '48px 32px' }}>
          {step === 'processing' ? (
            <>
              <Loader2 size={48} color="#7c3aed" style={{ margin: '0 auto 24px', animation: 'spin-slow 1s linear infinite' }} />
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Processing via Supabase…</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>Saving {rows.length} records to database</p>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden', maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ height: '100%', borderRadius: '999px', width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', transition: 'width 0.3s ease', boxShadow: '0 0 12px rgba(124,58,237,0.5)' }} />
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.875rem', fontWeight: 700, color: '#a78bfa' }}>{Math.round(progress)}%</div>
            </>
          ) : (
            <>
              <div style={{ width: '72px', height: '72px', margin: '0 auto 20px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={36} color="#10b981" />
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Done!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{processLog.created} salary records saved to Supabase</p>
              {processLog.errors.length > 0 && (
                <div style={{ margin: '16px auto', maxWidth: '420px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '14px', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>Errors ({processLog.errors.length})</div>
                  {processLog.errors.map((e, i) => <div key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>• {e}</div>)}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                <button className="btn-secondary" onClick={handleReset}><RefreshCw size={14} /> New Upload</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info cards (idle only) */}
      {step === 'idle' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '📋', title: 'Required Columns', desc: REQUIRED_COLS.join(', ') + '. Missing any column will block processing.' },
            { icon: '🔍', title: 'Validation Checks', desc: 'Numeric fields, valid month names, positive net salary, no duplicate Employee ID + Month + Year combinations.' },
            { icon: '☁️', title: 'Saved to Supabase', desc: 'Validated records are matched to your Employees table by Employee ID and saved as salary_records.' },
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
