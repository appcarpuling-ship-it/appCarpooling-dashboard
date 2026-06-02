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
import UserDetail from './pages/UserDetail'
import TripDetail from './pages/TripDetail'
import BookingDetail from './pages/BookingDetail'
import PaymentDetail from './pages/PaymentDetail'
import CommissionDetail from './pages/CommissionDetail'
import NotificationDetail from './pages/NotificationDetail'
import Trips from './pages/Trips'
import Bookings from './pages/Bookings'
import Payments from './pages/Payments'
import Commissions from './pages/Commissions'
import Chat from './pages/Chat'
import Banners from './pages/Banners'
import NewsPage from './pages/News'
import Notifications from './pages/Notifications'
import UserReports from './pages/UserReports'
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
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="trips" element={<Trips />} />
        <Route path="trips/:id" element={<TripDetail />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="payments/:id" element={<PaymentDetail />} />
        <Route path="commissions/:id" element={<CommissionDetail />} />
        <Route path="notifications/:id" element={<NotificationDetail />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="payments" element={<Payments />} />
        <Route path="commissions" element={<Commissions />} />
        <Route path="chat" element={<Chat />} />
        <Route path="banners" element={<Banners />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="user-reports" element={<UserReports />} />
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