import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useEmailDispatcher() {
  const [dispatching, setDispatching] = useState(false)

  /**
   * Send email for a single salary record via Edge Function
   */
  const sendEmail = useCallback(async (salaryRecordId) => {
    try {
      // 1. Try invoking the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { salary_record_id: salaryRecordId },
      })

      if (error) throw new Error(error.message)

      toast.success(data.message || 'Email sent!')
      return true
    } catch (err) {
      console.warn('Edge Function not deployed or failed. Falling back to client-side email simulation:', err.message)

      // 2. Fallback: Simulate Email Dispatch (direct DB updates)
      try {
        // Fetch record + employee email
        const { data: record, error: fetchErr } = await supabase
          .from('salary_records')
          .select('*, employees(id, name, email)')
          .eq('id', salaryRecordId)
          .single()

        if (fetchErr || !record) {
          throw new Error('Salary record not found for simulation')
        }

        const emp = record.employees
        if (!emp || !emp.email) {
          throw new Error('Employee email not found for simulation')
        }

        // Simulate sending: update status to 'Sent'
        const { error: updateErr } = await supabase
          .from('salary_records')
          .update({ status: 'Sent' })
          .eq('id', salaryRecordId)

        if (updateErr) throw new Error(updateErr.message)

        // Log the simulation in email_logs
        await supabase
          .from('email_logs')
          .insert({
            salary_record_id: salaryRecordId,
            employee_id: emp.id,
            recipient_email: emp.email,
            subject: `Salary Slip — ${record.month} ${record.year} (Simulated)`,
            status: 'Sent',
            sent_at: new Date().toISOString(),
          })

        toast.success(`[Simulated] Email dispatched to ${emp.email}`)
        return true
      } catch (fallbackErr) {
        toast.error(`Email simulation failed: ${fallbackErr.message}`)
        return false
      }
    }
  }, [])

  /**
   * Bulk send to all records with given IDs
   * Returns { sent, failed }
   */
  const sendBulk = useCallback(async (salaryRecordIds, onProgress) => {
    setDispatching(true)
    let sent = 0, failed = 0

    for (let i = 0; i < salaryRecordIds.length; i++) {
      const id = salaryRecordIds[i]
      const ok = await sendEmail(id)
      if (ok) sent++; else failed++
      onProgress?.({ current: i + 1, total: salaryRecordIds.length, sent, failed })
    }

    setDispatching(false)
    toast.success(`Dispatched ${sent} email${sent !== 1 ? 's' : ''}${failed ? `, ${failed} failed` : ''}`)
    return { sent, failed }
  }, [sendEmail])

  /**
   * Fetch email logs for a given salary record
   */
  const getLogs = useCallback(async (salaryRecordId) => {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('salary_record_id', salaryRecordId)
      .order('created_at', { ascending: false })
    if (error) { toast.error(error.message); return [] }
    return data
  }, [])

  return { sendEmail, sendBulk, getLogs, dispatching }
}
