import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Users, FileText, Send, TrendingUp,
  Activity, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import {
  employees, salaryData, monthlyPayrollTrend,
  departmentDistribution, recentActivity, getNetSalary
} from '../data/mockData'

const StatCard = ({ label, value, sub, icon: Icon, colorClass, delay }) => (
  <div
    className={`card stat-card ${colorClass}`}
    style={{ position: 'relative', overflow: 'hidden', animationDelay: delay }}
  >
    {/* Background glow */}
    <div style={{
      position: 'absolute', top: '-30px', right: '-30px',
      width: '100px', height: '100px',
      background: colorClass.includes('purple') ? 'rgba(124,58,237,0.08)'
        : colorClass.includes('cyan') ? 'rgba(6,182,212,0.08)'
        : colorClass.includes('green') ? 'rgba(16,185,129,0.08)'
        : 'rgba(245,158,11,0.08)',
      borderRadius: '50%', filter: 'blur(20px)',
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
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

const activityIcon = { generate: FileText, email: Send, upload: Activity }
const activityColor = { generate: '#a78bfa', email: '#22d3ee', upload: '#34d399' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
      borderRadius: '10px', padding: '10px 14px',
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.95rem' }}>
        ₹{payload[0].value.toLocaleString('en-IN')}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const totalPayroll = salaryData.reduce((s, r) => s + getNetSalary(r), 0)
  const sentCount    = salaryData.filter(r => r.status === 'Sent').length
  const genCount     = salaryData.filter(r => r.status === 'Generated').length
  const pendCount    = salaryData.filter(r => r.status === 'Pending').length

  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ animationDelay: '0ms' }} className="animate-fade-in-up">
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
          Welcome back, Admin 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Here's your payroll summary for <strong style={{ color: 'var(--text-primary)' }}>May 2026</strong>
        </p>
      </div>

      {/* Stat Cards */}
      <div
        className="animate-fade-in-up"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}
      >
        <StatCard label="Total Employees"  value={employees.length}  sub="Active this month"        icon={Users}     colorClass="stat-card-purple" delay="0ms"   />
        <StatCard label="Total Payroll"    value={`₹${(totalPayroll/100000).toFixed(1)}L`} sub="Net disbursement" icon={TrendingUp} colorClass="stat-card-cyan"   delay="60ms"  />
        <StatCard label="Slips Sent"       value={sentCount}         sub={`of ${salaryData.length} generated`} icon={Send}  colorClass="stat-card-green"  delay="120ms" />
        <StatCard label="Pending Actions"  value={pendCount}         sub="Needs attention"          icon={AlertCircle} colorClass="stat-card-amber" delay="180ms" />
      </div>

      {/* Chart + Activity */}
      <div
        className="animate-fade-in-up"
        style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', animationDelay: '200ms' }}
      >
        {/* Payroll Trend */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                Payroll Trend
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 6 months total payout</p>
            </div>
            <span className="badge badge-success">↑ 3.8%</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyPayrollTrend}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={2.5} fill="url(#grad1)" dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Pie */}
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
            Department Split
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Employees by team</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={departmentDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {departmentDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip 
                formatter={(v) => [`${v} employees`]} 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '8px', fontSize: '12px' }} 
                itemStyle={{ color: '#f1f5f9' }}
                labelStyle={{ color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {departmentDistribution.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + Slip Status */}
      <div
        className="animate-fade-in-up"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', animationDelay: '300ms' }}
      >
        {/* Activity Feed */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Activity size={17} color="#a78bfa" />
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
              Recent Activity
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.map(item => {
              const Icon = activityIcon[item.type]
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                    background: `${activityColor[item.type]}18`,
                    border: `1px solid ${activityColor[item.type]}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={15} color={activityColor[item.type]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.action}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.employee}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <Clock size={11} />
                    {item.time}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Slip Status */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <FileText size={17} color="#22d3ee" />
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
              Slip Status — May 2026
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Sent', count: sentCount, color: '#10b981', total: salaryData.length },
              { label: 'Generated', count: genCount, color: '#7c3aed', total: salaryData.length },
              { label: 'Pending', count: pendCount, color: '#f59e0b', total: salaryData.length },
            ].map(bar => (
              <div key={bar.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{bar.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{bar.count}/{bar.total}</span>
                </div>
                <div style={{ height: '7px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '999px',
                    width: `${(bar.count / bar.total) * 100}%`,
                    background: bar.color,
                    transition: 'width 1s ease',
                    boxShadow: `0 0 8px ${bar.color}60`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div style={{
            marginTop: '20px',
            padding: '14px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Payroll Breakdown
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Gross Payroll', value: `₹${((salaryData.reduce((s,r)=>s+r.baseSalary+r.hra+r.allowances,0))/100000).toFixed(1)}L` },
                { label: 'Total Deductions', value: `₹${((salaryData.reduce((s,r)=>s+r.deductions,0))/1000).toFixed(0)}K` },
                { label: 'Net Payroll', value: `₹${(totalPayroll/100000).toFixed(1)}L` },
                { label: 'Avg. Salary', value: `₹${Math.round(totalPayroll/salaryData.length).toLocaleString('en-IN')}` },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
