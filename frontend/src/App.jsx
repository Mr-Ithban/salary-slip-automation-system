import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import UploadPortal from './pages/UploadPortal'
import EmployeeManagement from './pages/EmployeeManagement'
import SalarySlips from './pages/SalarySlips'
import EmailDispatcher from './pages/EmailDispatcher'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111118',
            color: '#f1f5f9',
            border: '1px solid #2a2a3e',
            borderRadius: '12px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#111118' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#111118' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/upload"      element={<UploadPortal />} />
          <Route path="/employees"   element={<EmployeeManagement />} />
          <Route path="/slips"       element={<SalarySlips />} />
          <Route path="/email"       element={<EmailDispatcher />} />
          <Route path="/settings"    element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
