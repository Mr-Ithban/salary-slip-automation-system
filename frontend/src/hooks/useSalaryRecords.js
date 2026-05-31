import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useSalaryRecords(filters = {}) {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('salary_records')
      .select(`
        *,
        employees (id, emp_id, name, email, designation, department)
      `)
      .order('created_at', { ascending: false })

    if (filters.month) query = query.eq('month', filters.month)
    if (filters.year)  query = query.eq('year',  filters.year)
    if (filters.status) query = query.eq('status', filters.status)

    const { data, error } = await query
    if (error) { setError(error.message); toast.error('Failed to load salary records') }
    else setRecords(data || [])
    setLoading(false)
  }, [filters.month, filters.year, filters.status])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  // Get dashboard stats
  const getStats = () => ({
    total:     records.length,
    sent:      records.filter(r => r.status === 'Sent').length,
    generated: records.filter(r => r.status === 'Generated').length,
    pending:   records.filter(r => r.status === 'Pending').length,
    totalNet:  records.reduce((s, r) => s + Number(r.net_salary || 0), 0),
  })

  // Update a single record's status
  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('salary_records')
      .update({ status })
      .eq('id', id)
    if (error) { toast.error(error.message); return false }
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    return true
  }

  return { records, loading, error, refetch: fetchRecords, getStats, updateStatus }
}
