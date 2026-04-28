import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'
import Landing from '@/pages/Landing'
import Services from '@/pages/Services'
import BookingPage from '@/pages/BookingPage'
import BookingSuccess from '@/pages/BookingSuccess'
import AdminLogin from '@/pages/admin/Login'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminOrders from '@/pages/admin/Orders'
import AdminServices from '@/pages/admin/Services'
import AdminReports from '@/pages/admin/Reports'
import AdminSettings from '@/pages/admin/Settings'
import AdminCustomers from '@/pages/admin/Customers'
import Contact from '@/pages/Contact'
import AdminLayout from '@/components/layout/AdminLayout'
import { AdminGuard } from '@/components/layout/AdminGuard'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/booking-success/:orderNumber" element={<BookingSuccess />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin protected */}
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', background: '#1e293b', color: '#fff', fontSize: '14px' },
          success: { iconTheme: { primary: '#00C4B4', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  )
}
