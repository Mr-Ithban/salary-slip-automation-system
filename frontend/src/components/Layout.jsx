import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '200px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
