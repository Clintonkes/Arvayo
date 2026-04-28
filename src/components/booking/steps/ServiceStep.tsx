import { useQuery } from '@tanstack/react-query'
import { fetchServices } from '@/lib/api'
import { BookingData } from '../BookingWizard'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  data: BookingData
  onUpdate: (fields: Partial<BookingData>) => void
  onNext: () => void
}

const ICON_MAP: Record<string, string> = {
  home: '🏠',
  sparkles: '✨',
  truck: '🚚',
  'building-2': '🏢',
  'hard-hat': '⚒️',
  sun: '🪟',
}

export default function ServiceStep({ data, onUpdate, onNext }: Props) {
  const { data: services, isLoading, isError, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  })

  const handleSelect = (svc: any) => {
    onUpdate({
      serviceId: svc.id,
      serviceName: svc.name,
      servicePrice: parseFloat(svc.price),
      serviceDuration: svc.duration_minutes,
    })
  }

  const handleNext = () => {
    if (!data.serviceId) {
      toast.error('Please select a service to continue')
      return
    }
    onNext()
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-1">Choose Your Service</h2>
        <p className="text-slate-500 text-sm">Select the cleaning service that best fits your needs</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-9 h-9 text-primary animate-spin" />
          <p className="text-sm text-slate-500">Loading services…</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-slate-600 font-medium">Could not load services</p>
          <p className="text-sm text-slate-400">Please check your connection and try again</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      ) : !services?.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <p className="text-slate-600 font-medium">No services available</p>
          <p className="text-sm text-slate-400">Please contact us at (602) 583-8563 to book</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {services.map((svc: any) => {
            const selected = data.serviceId === svc.id
            const features: string[] = svc.features ? JSON.parse(svc.features) : []
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => handleSelect(svc)}
                className={`cursor-pointer text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  selected
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ICON_MAP[svc.icon] || '✨'}</span>
                    <div>
                      <p className="font-semibold text-navy text-sm">{svc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-primary font-bold text-sm">{formatCurrency(parseFloat(svc.price))}</span>
                        <span className="text-slate-400 text-xs flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          ~{Math.floor(svc.duration_minutes / 60)}h{svc.duration_minutes % 60 > 0 ? `${svc.duration_minutes % 60}m` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{svc.short_description || svc.description}</p>
                {features.slice(0, 2).length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {features.slice(0, 2).map((f: string) => (
                      <li key={f} className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            )
          })}
        </div>
      )}

      {data.serviceId > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20 mb-4">
          <div>
            <p className="text-sm font-semibold text-navy">{data.serviceName}</p>
            <p className="text-xs text-slate-500">Selected service</p>
          </div>
          <span className="text-primary font-bold text-lg">{formatCurrency(data.servicePrice)}</span>
        </div>
      )}

      {!data.serviceId && services?.length > 0 && (
        <p className="text-center text-xs text-slate-400 mb-3">
          👆 Tap a service above to select it, then continue
        </p>
      )}

      <Button onClick={handleNext} className="w-full" size="lg">
        Continue to Date &amp; Time →
      </Button>
    </div>
  )
}
