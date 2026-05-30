import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Mail, Phone, Building2, Filter } from 'lucide-react'
import { employees } from '../data/mockData'
import toast from 'react-hot-toast'

const AVATAR_COLORS = [
  '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
]

export default function EmployeeManagement() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const departments = ['All', ...new Set(employees.map(e => e.department))]

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    const matchDept = dept === 'All' || e.department === dept
    return matchSearch && matchDept
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px',
          background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
          borderRadius: '10px', padding: '9px 14px',
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search employees by name, ID or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%',
            }}
          />
        </div>

        {/* Dept filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Filter size={14} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
          {departments.map(d => (
            <button key={d}
              onClick={() => setDept(d)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '0.78rem',
                fontWeight: dept === d ? 700 : 500, cursor: 'pointer',
                background: dept === d ? 'rgba(124,58,237,0.2)' : 'var(--bg-card)',
                color: dept === d ? '#a78bfa' : 'var(--text-secondary)',
                border: `1px solid ${dept === d ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}
            >{d}</button>
          ))}
        </div>

        <button id="add-employee-btn" className="btn-primary" onClick={() => { toast.success('Add Employee modal — connect backend!'); setShowAdd(true) }}>
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

      {/* Employee Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map((emp, idx) => (
          <div
            key={emp.id}
            className="card animate-fade-in-up"
            style={{
              cursor: 'pointer',
              transition: 'all 0.25s',
              animationDelay: `${idx * 40}ms`,
              border: selected?.id === emp.id ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border)',
            }}
            onClick={() => setSelected(selected?.id === emp.id ? null : emp)}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              {/* Avatar */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff',
                boxShadow: `0 4px 14px ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}50`,
              }}>
                {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {emp.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600, marginBottom: '6px' }}>{emp.designation}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <Building2 size={11} />{emp.department}
                </div>
              </div>

              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{emp.id}</span>
            </div>

            {/* Expanded details */}
            {selected?.id === emp.id && (
              <div style={{
                marginTop: '14px', paddingTop: '14px',
                borderTop: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', gap: '8px',
                animation: 'fadeInUp 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Mail size={13} color="#a78bfa" />{emp.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DOB:</span> {emp.dob}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Joined:</span> {emp.joinDate}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}
                    onClick={e => { e.stopPropagation(); toast('Edit — connect backend!') }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button style={{
                    padding: '6px 12px', fontSize: '0.75rem', flex: 1,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    transition: 'all 0.2s',
                  }}
                    onClick={e => { e.stopPropagation(); toast.error('Delete — connect backend!') }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>No employees found</div>
            <div style={{ fontSize: '0.825rem' }}>Try a different search or filter</div>
          </div>
        )}
      </div>
    </div>
  )
}
