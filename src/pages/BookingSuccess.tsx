import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchOrderByNumber } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Calendar, MapPin, User, Phone, Mail, Printer, Home, Loader2, Clock } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export default function BookingSuccess() {
  const { orderNumber } = useParams()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => fetchOrderByNumber(orderNumber!),
    enabled: !!orderNumber,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Booking not found.</p>
        <Button asChild><Link to="/">Go Home</Link></Button>
      </div>
    )
  }

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-navy text-right flex-1">{value}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald/10 border-4 border-emerald flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-slate-500 mb-4">Thank you for choosing Arvayo LLC. We'll be in touch shortly!</p>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary font-bold text-lg px-6 py-2 rounded-full">
            {order.order_number}
          </div>
          <p className="text-sm text-slate-400 mt-2">Save this order number for your records</p>
        </div>

        {/* Booking summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6" id="booking-summary">
          {/* Service card */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Service Booked</p>
                <p className="text-xl font-bold">{order.service?.name}</p>
                <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  ~{Math.floor((order.service?.duration_minutes || 120) / 60)}h
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold">{formatCurrency(parseFloat(order.total_price))}</p>
                <Badge className="mt-1 bg-white/20 text-white border-0 text-xs">
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Appointment */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-slate-700">Appointment Details</p>
              </div>
              <Row label="Date" value={formatDate(order.scheduled_date)} />
              <Row label="Time" value={formatTime(order.scheduled_time)} />
            </div>

            {/* Property */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-slate-700">Property</p>
              </div>
              <Row label="Address" value={order.address} />
              <Row label="City / State / ZIP" value={`${order.city}, ${order.state} ${order.zip_code}`} />
              <Row label="Bedrooms / Baths" value={`${order.num_bedrooms} bed / ${order.num_bathrooms} bath`} />
              {order.has_pets && <Row label="Pets" value="Yes (noted)" />}
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-slate-700">Contact Information</p>
              </div>
              <Row label="Name" value={order.customer_name} />
              <Row label="Email" value={
                <a href={`mailto:${order.customer_email}`} className="text-primary hover:underline flex items-center gap-1 justify-end">
                  <Mail className="w-3.5 h-3.5" /> {order.customer_email}
                </a>
              } />
              <Row label="Phone" value={
                <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline flex items-center gap-1 justify-end">
                  <Phone className="w-3.5 h-3.5" /> {order.customer_phone}
                </a>
              } />
            </div>

            {order.special_instructions && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Special Instructions</p>
                <p className="text-sm text-amber-800">{order.special_instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Email confirmation note */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
          <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            A confirmation email has been sent to <strong>{order.customer_email}</strong>. Check your inbox (and spam folder) for full details.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
          <Button asChild className="flex-1">
            <Link to="/">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Questions? Call us at <a href="tel:+16025838563" className="text-primary font-medium">(602) 583-8563</a> or email{' '}
          <a href="mailto:arvayollc@proton.me" className="text-primary font-medium">arvayollc@proton.me</a>
        </p>
      </div>

      <Footer />
    </div>
  )
}
