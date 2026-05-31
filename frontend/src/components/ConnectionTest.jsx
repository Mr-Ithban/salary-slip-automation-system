import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

/**
 * Drop this component temporarily on any page to test Supabase connectivity.
 * Remove once confirmed working.
 * Usage: import ConnectionTest from '../components/ConnectionTest'
 *        Then add <ConnectionTest /> anywhere in JSX
 */
export default function ConnectionTest() {
  const [status, setStatus] = useState('testing')  // testing | ok | error
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState(null)

  useEffect(() => {
    async function test() {
      try {
        // 1. Test basic connectivity - just check if we can reach Supabase
        const { data, error } = await supabase
          .from('employees')
          .select('count', { count: 'exact', head: true })

        if (error) {
          setStatus('error')
          setMessage(error.message)
          setDetails(error)
        } else {
          setStatus('ok')
          setMessage(`Connected! Found ${data ?? 0} employees.`)
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.message)
      }
    }
    test()
  }, [])

  const colors = { testing: '#fbbf24', ok: '#10b981', error: '#ef4444' }
  const color = colors[status]

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
      background: 'var(--bg-card)', border: `1px solid ${color}40`,
      borderRadius: '12px', padding: '14px 18px', maxWidth: '380px',
      boxShadow: `0 4px 20px ${color}20`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: details ? '8px' : 0 }}>
        {status === 'testing' && <Loader2 size={16} color={color} style={{ animation: 'spin-slow 0.9s linear infinite' }} />}
        {status === 'ok'      && <CheckCircle size={16} color={color} />}
        {status === 'error'   && <XCircle size={16} color={color} />}
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>
          {status === 'testing' ? 'Testing Supabase connection…'
           : status === 'ok'   ? 'Supabase Connected ✓'
           :                     'Supabase Error'}
        </span>
      </div>
      {message && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{message}</div>
      )}
      {details && (
        <details style={{ marginTop: '8px' }}>
          <summary style={{ fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Details</summary>
          <pre style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
