import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Mail, Building2, Filter, Loader2, X, Save } from 'lucide-react'
import { useEmployees } from '../hooks/useEmployees'
import toast from 'react-hot-toast'

const AVATAR_COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']

const EMPTY_FORM = { emp_id: '', name: '', email: '', designation: '', department: '', dob: '', join_date: '' }

export default function EmployeeManagement() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees()

  const [search, setSearch]     = useState('')
  const [dept, setDept]         = useState('All')
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // null = add, emp obj = edit
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)

  const departments = ['All', ...new Set(employees.map(e => e.department))]

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    return (e.name.toLowerCase().includes(q) || e.emp_id.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)) &&
           (dept === 'All' || e.department === dept)
  })

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (emp) => {
    setEditTarget(emp)
    setForm({
      emp_id: emp.emp_id, name: emp.name, email: emp.email,
      designation: emp.designation, department: emp.department,
      dob: emp.dob || '', join_date: emp.join_date || '',
    })
    setShowModal(true)
    setSelected(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    if (editTarget) {
      await updateEmployee(editTarget.id, form)
    } else {
      await addEmployee(form)
    }
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this employee?')) return
    await deleteEmployee(id)
    setSelected(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '20px', width: '500px', maxWidth: '100%', animation: 'fadeInUp 0.25s ease' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                {editTarget ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Employee ID', key: 'emp_id', placeholder: 'EMP009', type: 'text', required: true },
                { label: 'Full Name',   key: 'name',   placeholder: 'John Doe', type: 'text', required: true },
                { label: 'Email',       key: 'email',  placeholder: 'john@company.com', type: 'email', required: true, span: 2 },
                { label: 'Designation', key: 'designation', placeholder: 'Software Engineer', type: 'text', required: true },
                { label: 'Department',  key: 'department',  placeholder: 'Engineering', type: 'text', required: true },
                { label: 'Date of Birth', key: 'dob', placeholder: '', type: 'date' },
                { label: 'Join Date',   key: 'join_date', placeholder: '', type: 'date' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.span === 2 ? '1 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{f.label}</label>
                  <input
                    type={f.type}
                    className="input-field"
                    placeholder={f.placeholder}
                    required={f.required}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : <Save size={14} />}
                  {editTarget ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '10px', padding: '9px 14px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input type="text" placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} color="var(--text-muted)" />
          {departments.map(d => (
            <button key={d} onClick={() => setDept(d)} style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '0.78rem',
              fontWeight: dept === d ? 700 : 500, cursor: 'pointer',
              background: dept === d ? 'rgba(124,58,237,0.2)' : 'var(--bg-card)',
              color: dept === d ? '#a78bfa' : 'var(--text-secondary)',
              border: `1px solid ${dept === d ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}>{d}</button>
          ))}
        </div>
        <button id="add-employee-btn" className="btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          { label: 'Total', value: employees.length, color: '#a78bfa' },
          { label: 'Filtered', value: filtered.length, color: '#22d3ee' },
          { label: 'Departments', value: departments.length - 1, color: '#34d399' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}<br />Employees</div>
          </div>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '16px' }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} className="shimmer-bg" style={{ height: '120px', borderRadius: '16px' }} />
          ))}
        </div>
      )}

      {/* Employee Cards */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map((emp, idx) => (
            <div key={emp.id}
              className="card animate-fade-in-up"
              style={{
                cursor: 'pointer', transition: 'all 0.25s', animationDelay: `${idx * 40}ms`,
                border: selected?.id === emp.id ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border)',
              }}
              onClick={() => setSelected(selected?.id === emp.id ? null : emp)}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                  background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff',
                  boxShadow: `0 4px 14px ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}50`,
                }}>
                  {emp.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600, marginBottom: '6px' }}>{emp.designation}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <Building2 size={11} />{emp.department}
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{emp.emp_id}</span>
              </div>

              {selected?.id === emp.id && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeInUp 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Mail size={13} color="#a78bfa" />{emp.email}
                  </div>
                  {emp.dob && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DOB: </span>{emp.dob}
                    </div>
                  )}
                  {emp.join_date && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Joined: </span>{emp.join_date}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}
                      onClick={e => { e.stopPropagation(); openEdit(emp) }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button style={{
                      padding: '6px 12px', fontSize: '0.75rem', flex: 1, cursor: 'pointer',
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s',
                    }}
                      onClick={e => { e.stopPropagation(); handleDelete(emp.id) }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>No employees found</div>
              <div style={{ fontSize: '0.825rem' }}>Try a different search or filter, or add employees via the button above.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
