import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Mail, Lock, Bell, Palette, Save, Eye, EyeOff, Shield, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const Section = ({ icon: Icon, title, children }) => (
  <div className="card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} color="#a78bfa" />
      </div>
      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{title}</h3>
    </div>
    {children}
  </div>
)

const Field = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{hint}</div>}
  </div>
)

const Toggle = ({ label, sub, value, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
    <div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
    <button
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '999px', border: 'none',
        cursor: 'pointer', position: 'relative', transition: 'all 0.25s',
        background: value ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'var(--bg-secondary)',
        boxShadow: value ? '0 2px 8px rgba(124,58,237,0.4)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: '3px', left: value ? '22px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.25s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  </div>
)

export default function Settings() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [smtp, setSmtp] = useState({ host: 'smtp.gmail.com', port: '587', user: 'admin@company.com', pass: '' })
  const [company, setCompany] = useState({ name: 'TechCorp Pvt. Ltd.', address: 'Bangalore, India', cin: 'U72200KA2020PTC123456' })
  const [notifs, setNotifs] = useState({ onUpload: true, onGenerate: true, onSend: true, weeklyReport: false })
  const [security, setSecurity] = useState({ passwordProtect: false, auditLog: true, twoFactor: false })

  // Fetch settings on mount
  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      const { data, error } = await supabase.from('system_settings').select('*')
      if (error) {
        console.error('Failed to load settings:', error.message)
      } else if (data) {
        data.forEach(item => {
          if (item.key === 'smtp_config') setSmtp(item.value)
          if (item.key === 'company_config') setCompany(item.value)
        })
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleSave = async (section) => {
    setLoading(true)
    let key = ''
    let value = {}

    if (section === 'SMTP') {
      key = 'smtp_config'
      value = smtp
    } else if (section === 'Company') {
      key = 'company_config'
      value = company
    }

    if (key) {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })

      if (error) {
        toast.error(`Failed to save ${section} settings: ${error.message}`)
      } else {
        toast.success(`${section} settings saved live to Supabase!`)
      }
    } else {
      toast.success(`${section} settings saved!`)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>

      {/* Company Info */}
      <Section icon={SettingsIcon} title="Company Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Company Name">
            <input
              className="input-field"
              value={company.name}
              onChange={e => setCompany(p => ({ ...p, name: e.target.value }))}
            />
          </Field>
          <Field label="CIN / Registration Number">
            <input
              className="input-field"
              value={company.cin}
              onChange={e => setCompany(p => ({ ...p, cin: e.target.value }))}
            />
          </Field>
          <Field label="Address" hint="Shown on salary slips">
            <input
              className="input-field"
              value={company.address}
              onChange={e => setCompany(p => ({ ...p, address: e.target.value }))}
            />
          </Field>
          <Field label="Slip Month/Year Label">
            <input className="input-field" defaultValue="May 2026" />
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={() => handleSave('Company')}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </Section>

      {/* SMTP Config */}
      <Section icon={Mail} title="SMTP / Email Configuration">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="SMTP Host" hint="e.g. smtp.gmail.com, smtp.sendgrid.net">
            <input
              className="input-field"
              value={smtp.host}
              onChange={e => setSmtp(p => ({ ...p, host: e.target.value }))}
            />
          </Field>
          <Field label="SMTP Port" hint="Common ports: 587 (TLS), 465 (SSL)">
            <input
              className="input-field"
              value={smtp.port}
              onChange={e => setSmtp(p => ({ ...p, port: e.target.value }))}
            />
          </Field>
          <Field label="Email / Username">
            <input
              className="input-field"
              type="email"
              value={smtp.user}
              onChange={e => setSmtp(p => ({ ...p, user: e.target.value }))}
            />
          </Field>
          <Field label="App Password / API Key">
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPass ? 'text' : 'password'}
                value={smtp.pass}
                placeholder="••••••••••••"
                onChange={e => setSmtp(p => ({ ...p, pass: e.target.value }))}
                style={{ paddingRight: '42px' }}
              />
              <button
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>

        {/* Provider shortcuts */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Quick provider presets</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Gmail', host: 'smtp.gmail.com', port: '587' },
              { label: 'SendGrid', host: 'smtp.sendgrid.net', port: '587' },
              { label: 'Mailgun', host: 'smtp.mailgun.org', port: '587' },
              { label: 'Outlook', host: 'smtp-mail.outlook.com', port: '587' },
            ].map(p => (
              <button key={p.label}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                onClick={() => { setSmtp(prev => ({ ...prev, host: p.host, port: p.port })); toast.success(`Preset: ${p.label}`) }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => toast('Connection test — connect backend!')}>
            Test Connection
          </button>
          <button className="btn-primary" onClick={() => handleSave('SMTP')}>
            <Save size={14} /> Save SMTP
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notification Preferences">
        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { key: 'onUpload',      label: 'Payroll Uploaded',       sub: 'Alert when a new payroll file is uploaded' },
            { key: 'onGenerate',    label: 'Slips Generated',         sub: 'Alert when salary slips are generated' },
            { key: 'onSend',        label: 'Emails Dispatched',       sub: 'Alert when all emails have been sent' },
            { key: 'weeklyReport',  label: 'Weekly Summary Report',   sub: 'Receive a weekly payroll activity digest' },
          ].map((n, i) => (
            <div key={n.key} style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <Toggle
                label={n.label}
                sub={n.sub}
                value={notifs[n.key]}
                onChange={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={() => handleSave('Notification')}>
            <Save size={14} /> Save Preferences
          </button>
        </div>
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security & Access">
        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { key: 'passwordProtect', label: 'Password-protect PDFs',  sub: 'PDF password = employee name + birth year' },
            { key: 'auditLog',        label: 'Enable Audit Log',        sub: 'Track all admin actions with timestamps' },
            { key: 'twoFactor',       label: 'Two-Factor Authentication', sub: 'Require OTP on login (connect backend)' },
          ].map((s, i) => (
            <div key={s.key} style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <Toggle
                label={s.label}
                sub={s.sub}
                value={security[s.key]}
                onChange={() => setSecurity(p => ({ ...p, [s.key]: !p[s.key] }))}
              />
            </div>
          ))}
        </div>

        {security.passwordProtect && (
          <div style={{
            padding: '14px', background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px',
            fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <strong style={{ color: '#a78bfa' }}>PDF Password Format:</strong><br />
            Password = <code style={{ background: 'rgba(124,58,237,0.15)', padding: '1px 6px', borderRadius: '4px', color: '#a78bfa' }}>
              {`{firstName}{birthYear}`}
            </code>
            <br />
            Example: For <em>Arjun Sharma (born 1990)</em> → <code style={{ background: 'rgba(124,58,237,0.15)', padding: '1px 6px', borderRadius: '4px', color: '#a78bfa' }}>Arjun1990</code>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={() => handleSave('Security')}>
            <Lock size={14} /> Save Security Settings
          </button>
        </div>
      </Section>

      {/* Danger Zone */}
      <div className="card animate-fade-in-up" style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#f87171' }}>Danger Zone</h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          These actions are irreversible. Proceed with caution.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['Clear All Salary Data', 'Reset Employee Records', 'Wipe Audit Logs'].map(label => (
            <button key={label}
              style={{
                padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171', borderRadius: '8px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              onClick={() => toast.error(`${label} — connect backend to confirm!`)}
            >{label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
