import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('emp_id', { ascending: true })

    if (error) { setError(error.message); toast.error('Failed to load employees') }
    else setEmployees(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  // CREATE
  const addEmployee = async (payload) => {
    const { data, error } = await supabase
      .from('employees')
      .insert(payload)
      .select()
      .single()
    if (error) { toast.error(error.message); return null }
    toast.success('Employee added!')
    setEmployees(prev => [...prev, data])
    return data
  }

  // UPDATE
  const updateEmployee = async (id, payload) => {
    const { data, error } = await supabase
      .from('employees')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) { toast.error(error.message); return null }
    toast.success('Employee updated!')
    setEmployees(prev => prev.map(e => e.id === id ? data : e))
    return data
  }

  // SOFT DELETE
  const deleteEmployee = async (id) => {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', id)
    if (error) { toast.error(error.message); return false }
    toast.success('Employee removed')
    setEmployees(prev => prev.filter(e => e.id !== id))
    return true
  }

  return { employees, loading, error, refetch: fetchEmployees, addEmployee, updateEmployee, deleteEmployee }
}
