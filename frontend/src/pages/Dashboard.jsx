import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, FileText, Send, TrendingUp,
  Activity, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import { useEmployees }     from '../hooks/useEmployees'
import { useSalaryRecords } from '../hooks/useSalaryRecords'

// ---- helpers ----
const CURRENT_MONTH = new Date().toLocaleString('en-US', { month: 'long' })
const CURRENT_YEAR  = new Date().getFullYear()

const DEPT_COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6']

const StatCard = ({ label, value, sub, icon: Icon, colorClass }) => (
  <div className={`card stat-card ${colorClass}`} style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', top: '-30px', right: '-30px',
      width: '100px', height: '100px', borderRadius: '50%', filter: 'blur(20px)',
      background: colorClass.includes('purple') ? 'rgba(124,58,237,0.08)'
        : colorClass.includes('cyan') ? 'rgba(6,182,212,0.08)'
        : colorClass.includes('green') ? 'rgba(16,185,129,0.08)'
        : 'rgba(245,158,11,0.08)',
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{sub}</div>
      </div>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: colorClass.includes('purple') ? 'rgba(124,58,237,0.15)'
          : colorClass.includes('cyan') ? 'rgba(6,182,212,0.15)'
          : colorClass.includes('green') ? 'rgba(16,185,129,0.15)'
          : 'rgba(245,158,11,0.15)',
        border: `1px solid ${
          colorClass.includes('purple') ? 'rgba(124,58,237,0.25)'
          : colorClass.includes('cyan') ? 'rgba(6,182,212,0.25)'
          : colorClass.includes('green') ? 'rgba(16,185,129,0.25)'
          : 'rgba(245,158,11,0.25)'
        }`,
      }}>
        <Icon size={22} color={
          colorClass.includes('purple') ? '#a78bfa'
          : colorClass.includes('cyan') ? '#22d3ee'
          : colorClass.includes('green') ? '#34d399'
          : '#fbbf24'
        } />
      </div>
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '10px', padding: '10px 14px' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.95rem' }}>
        ₹{Number(payload[0].value).toLocaleString('en-IN')}
      </div>
    </div>
  )
}

const Skeleton = () => (
  <div className="shimmer-bg" style={{ height: '120px', borderRadius: '16px' }} />
)

export default function Dashboard() {
  const { employees, loading: empLoading }             = useEmployees()
  const { records, loading: recLoading, getStats }     = useSalaryRecords({ month: CURRENT_MONTH, year: CURRENT_YEAR })

  const loading = empLoading || recLoading
  const stats   = getStats()

  // Build department distribution from live employees
  const deptMap = {}
  employees.forEach(e => { deptMap[e.department] = (deptMap[e.department] || 0) + 1 })
  const deptData = Object.entries(deptMap).map(([name, value], i) => ({
    name, value, color: DEPT_COLORS[i % DEPT_COLORS.length],
  }))

  // Status bars
  const statusBars = [
    { label: 'Sent',      count: stats.sent,      color: '#10b981', total: stats.total },
    { label: 'Generated', count: stats.generated, color: '#7c3aed', total: stats.total },
    { label: 'Pending',   count: stats.pending,   color: '#f59e0b', total: stats.total },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
          Welcome back, Admin 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Payroll summary for <strong style={{ color: 'var(--text-primary)' }}>{CURRENT_MONTH} {CURRENT_YEAR}</strong>
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          {[...Array(4)].map((_,i) => <Skeleton key={i} />)}
        </div>
      ) : (
        <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          <StatCard label="Total Employees" value={employees.length} sub="Active employees"        icon={Users}      colorClass="stat-card-purple" />
          <StatCard label="Total Payroll"   value={`₹${(stats.totalNet/100000).toFixed(1)}L`} sub="Net this month" icon={TrendingUp} colorClass="stat-card-cyan"   />
          <StatCard label="Slips Sent"      value={stats.sent}  sub={`of ${stats.total} generated`} icon={Send}   colorClass="stat-card-green"  />
          <StatCard label="Pending Actions" value={stats.pending} sub="Needs attention"            icon={AlertCircle} colorClass="stat-card-amber" />
        </div>
      )}

      {/* Charts row */}
      <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        {/* Payroll trend — placeholder (connect real monthly aggregation later) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>Payroll Trend</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 6 months</p>
            </div>
            <span className="badge badge-success">Live</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', fontSize: '0.85rem', flexDirection: 'column', gap: '8px' }}>
            <TrendingUp size={32} color="#7c3aed" />
            <span>Trend chart populates with historical payroll data</span>
            <span style={{ fontSize: '0.72rem' }}>Add multiple months to see the chart</span>
          </div>
        </div>

        {/* Department Pie */}
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Department Split</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Employees by team</p>
          {loading ? <Skeleton /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4} strokeWidth={0}>
                    {deptData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={v => [`${v} employees`]}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f1f5f9' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {deptData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />{d.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status bars */}
      <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <FileText size={17} color="#22d3ee" />
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
              Slip Status — {CURRENT_MONTH} {CURRENT_YEAR}
            </h3>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(3)].map((_,i) => <div key={i} className="shimmer-bg" style={{ height: '32px', borderRadius: '8px' }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {statusBars.map(bar => (
                <div key={bar.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{bar.label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{bar.count}/{bar.total || 1}</span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '999px',
                      width: `${bar.total ? (bar.count / bar.total) * 100 : 0}%`,
                      background: bar.color, transition: 'width 1s ease',
                      boxShadow: `0 0 8px ${bar.color}60`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Payroll Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Activity size={17} color="#a78bfa" />
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem' }}>Payroll Breakdown</h3>
          </div>
          {loading ? (
            <div className="shimmer-bg" style={{ height: '120px', borderRadius: '12px' }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Gross Payroll', value: `₹${((records.reduce((s,r) => s + Number(r.base_salary||0) + Number(r.hra||0) + Number(r.allowances||0), 0)) / 100000).toFixed(1)}L` },
                { label: 'Total Deductions', value: `₹${(records.reduce((s,r) => s + Number(r.deductions||0), 0) / 1000).toFixed(0)}K` },
                { label: 'Net Payroll', value: `₹${(stats.totalNet / 100000).toFixed(1)}L` },
                { label: 'Avg. Salary', value: records.length ? `₹${Math.round(stats.totalNet / records.length).toLocaleString('en-IN')}` : '—' },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
