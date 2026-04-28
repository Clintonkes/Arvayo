import { useQuery } from '@tanstack/react-query'
import { fetchServices } from '@/lib/api'
import { BookingData } from '../BookingWizard'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, DollarSign, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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
  const { data: services, isLoading } = useQuery({
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
    if (data.serviceId) onNext()
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-1">Choose Your Service</h2>
        <p className="text-slate-500 text-sm">Select the cleaning service that best fits your needs</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {services?.map((svc: any) => {
            const selected = data.serviceId === svc.id
            const features = svc.features ? JSON.parse(svc.features) : []
            return (
              <button
                key={svc.id}
                onClick={() => handleSelect(svc)}
                className={`text-left p-4 rounded-2xl border-2 transition-all hover:border-primary ${
                  selected
                    ? 'border-primary bg-primary/5 shadow-md'
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
                          ~{Math.floor(svc.duration_minutes / 60)}h
                        </span>
                      </div>
                    </div>
                  </div>
                  {selected && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
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

      <Button onClick={handleNext} disabled={!data.serviceId} className="w-full" size="lg">
        Continue to Date & Time →
      </Button>
    </div>
  )
}
