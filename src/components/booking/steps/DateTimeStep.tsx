import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAvailability } from '@/lib/api'
import { BookingData } from '../BookingWizard'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Clock, ChevronLeft, Loader2 } from 'lucide-react'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { formatTime } from '@/lib/utils'

interface Props {
  data: BookingData
  onUpdate: (fields: Partial<BookingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function DateTimeStep({ data, onUpdate, onNext, onBack }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    data.scheduledDate ? new Date(data.scheduledDate + 'T00:00:00') : undefined
  )

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''

  const { data: availability, isLoading } = useQuery({
    queryKey: ['availability', dateStr],
    queryFn: () => fetchAvailability(dateStr),
    enabled: !!dateStr,
  })

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      onUpdate({ scheduledDate: format(date, 'yyyy-MM-dd'), scheduledTime: '' })
    }
  }

  const handleTimeSelect = (time: string) => {
    onUpdate({ scheduledTime: time })
  }

  const canContinue = !!data.scheduledDate && !!data.scheduledTime

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-1">Select Date & Time</h2>
        <p className="text-slate-500 text-sm">Choose when you'd like your cleaning appointment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Calendar */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Pick a Date</p>
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => isBefore(date, startOfDay(addDays(new Date(), 1)))}
              fromDate={addDays(new Date(), 1)}
              className="w-full"
            />
          </div>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Available Times {selectedDate && `– ${format(selectedDate, 'MMM d')}`}
          </p>
          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              <Clock className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Select a date first</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : availability?.available_slots?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm font-medium">No slots available</p>
              <p className="text-xs mt-1">Please choose another date</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availability?.available_slots?.map((slot: string) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleTimeSelect(slot)}
                  className={`cursor-pointer py-3 px-3 rounded-xl border-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                    data.scheduledTime === slot
                      ? 'border-primary bg-primary text-white shadow-md'
                      : 'border-slate-200 hover:border-primary hover:bg-primary/5 text-slate-700'
                  }`}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {canContinue && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20 mb-4">
          <Clock className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-navy">
              {format(new Date(data.scheduledDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy')} at {formatTime(data.scheduledTime)}
            </p>
            <p className="text-xs text-slate-500">Your appointment time</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue} className="flex-1" size="lg">
          Continue →
        </Button>
      </div>
    </div>
  )
}
