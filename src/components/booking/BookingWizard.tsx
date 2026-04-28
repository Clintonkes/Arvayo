import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createBooking } from '@/lib/api'
import { Progress } from '@/components/ui/progress'
import ServiceStep from './steps/ServiceStep'
import DateTimeStep from './steps/DateTimeStep'
import PropertyStep from './steps/PropertyStep'
import ContactStep from './steps/ContactStep'
import ReviewStep from './steps/ReviewStep'
import { CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export interface BookingData {
  serviceId: number
  serviceName: string
  servicePrice: number
  serviceDuration: number
  scheduledDate: string
  scheduledTime: string
  address: string
  city: string
  state: string
  zipCode: string
  propertySqft: string
  numBedrooms: number
  numBathrooms: number
  hasPets: boolean
  customerName: string
  customerEmail: string
  customerPhone: string
  specialInstructions: string
}

const INITIAL_DATA: BookingData = {
  serviceId: 0,
  serviceName: '',
  servicePrice: 0,
  serviceDuration: 0,
  scheduledDate: '',
  scheduledTime: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  propertySqft: '',
  numBedrooms: 2,
  numBathrooms: 1,
  hasPets: false,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  specialInstructions: '',
}

const STEPS = [
  'Select Service',
  'Date & Time',
  'Property Details',
  'Your Info',
  'Review & Book',
]

export default function BookingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<BookingData>(INITIAL_DATA)

  const mutation = useMutation<{ order_number: string }, Error, Record<string, unknown>>({
    mutationFn: (payload) => createBooking(payload),
    onSuccess: (order) => {
      navigate(`/booking-success/${order.order_number}`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to create booking. Please try again.')
    },
  })

  const update = (fields: Partial<BookingData>) =>
    setData((prev) => ({ ...prev, ...fields }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      service_id: data.serviceId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zipCode,
      property_sqft: data.propertySqft ? parseInt(data.propertySqft) : null,
      num_bedrooms: data.numBedrooms,
      num_bathrooms: data.numBathrooms,
      has_pets: data.hasPets,
      scheduled_date: data.scheduledDate,
      scheduled_time: data.scheduledTime,
      special_instructions: data.specialInstructions || null,
    }
    mutation.mutate(payload)
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-navy mb-2">Book Your Cleaning</h1>
          <p className="text-slate-500">Complete the steps below to schedule your service</p>
        </div>

        {/* Step indicators */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-700">Step {step + 1} of {STEPS.length}</span>
            <span className="text-sm font-semibold text-primary">{STEPS[step]}</span>
          </div>
          <Progress value={progress} />
          <div className="flex justify-between mt-3">
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? 'bg-primary text-white'
                    : i === step
                    ? 'bg-primary/20 text-primary ring-2 ring-primary'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-slate-400'}`}>
                  {label.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          {step === 0 && <ServiceStep data={data} onUpdate={update} onNext={next} />}
          {step === 1 && <DateTimeStep data={data} onUpdate={update} onNext={next} onBack={back} />}
          {step === 2 && <PropertyStep data={data} onUpdate={update} onNext={next} onBack={back} />}
          {step === 3 && <ContactStep data={data} onUpdate={update} onNext={next} onBack={back} />}
          {step === 4 && (
            <ReviewStep
              data={data}
              onBack={back}
              onSubmit={handleSubmit}
              isLoading={mutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  )
}
