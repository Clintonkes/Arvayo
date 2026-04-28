import { BookingData } from '../BookingWizard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2, CheckCircle2, Calendar, MapPin, User, Clock } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

interface Props {
  data: BookingData
  onBack: () => void
  onSubmit: () => void
  isLoading: boolean
}

const Row = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500 flex-shrink-0 w-36">{label}</span>
    <span className="text-sm font-medium text-navy text-right">{value}</span>
  </div>
)

export default function ReviewStep({ data, onBack, onSubmit, isLoading }: Props) {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-1">Review Your Booking</h2>
        <p className="text-slate-500 text-sm">Please confirm all details are correct before submitting</p>
      </div>

      {/* Service */}
      <div className="mb-4 p-5 bg-gradient-to-r from-primary/5 to-teal-50 rounded-2xl border border-primary/20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Selected Service</p>
            <p className="text-lg font-bold text-navy">{data.serviceName}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              ~{Math.floor(data.serviceDuration / 60)}h {data.serviceDuration % 60 > 0 ? `${data.serviceDuration % 60}min` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-primary">{formatCurrency(data.servicePrice)}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-slate-700">Appointment</p>
          </div>
          <Row label="Date" value={formatDate(data.scheduledDate)} />
          <Row label="Time" value={formatTime(data.scheduledTime)} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-slate-700">Property</p>
          </div>
          <Row label="Address" value={data.address} />
          <Row label="City / State" value={`${data.city}, ${data.state} ${data.zipCode}`} />
          <Row label="Bedrooms" value={`${data.numBedrooms} bed / ${data.numBathrooms} bath`} />
          {data.propertySqft && <Row label="Square Footage" value={`${data.propertySqft} sq ft`} />}
          {data.hasPets && <Row label="Pets" value="Yes – pet-safe products will be used" />}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-slate-700">Contact</p>
          </div>
          <Row label="Name" value={data.customerName} />
          <Row label="Email" value={data.customerEmail} />
          <Row label="Phone" value={data.customerPhone} />
          {data.specialInstructions && (
            <Row label="Instructions" value={<span className="italic">{data.specialInstructions}</span>} />
          )}
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2.5 mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          By confirming, you agree to our cancellation policy. Cancellations made 24+ hours before the appointment are free. A confirmation email will be sent to <strong>{data.customerEmail}</strong>.
        </p>
      </div>

      <div className="flex gap-3 mt-5">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onSubmit} className="flex-2 flex-grow" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
