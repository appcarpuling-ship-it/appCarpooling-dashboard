import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './context/authStore'

// Layout components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Auth pages
import Login from './pages/Login'

// Dashboard pages
import Dashboard from './pages/Dashboard'
import Stats from './pages/Stats'
import Users from './pages/Users'
import Trips from './pages/Trips'
import Bookings from './pages/Bookings'
import Payments from './pages/Payments'
import Commissions from './pages/Commissions'
import Chat from './pages/Chat'
import Notifications from './pages/Notifications'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

// 404 page
import NotFound from './pages/NotFound'

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute adminRequired={true}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="stats" element={<Stats />} />
        <Route path="users" element={<Users />} />
        <Route path="trips" element={<Trips />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="payments" element={<Payments />} />
        <Route path="commissions" element={<Commissions />} />
        <Route path="chat" element={<Chat />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all route */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App