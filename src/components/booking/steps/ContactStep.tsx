import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookingData } from '../BookingWizard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, User, Mail, Phone, MessageSquare, Shield } from 'lucide-react'

const schema = z.object({
  customerName: z.string().min(2, 'Full name is required'),
  customerEmail: z.string().email('Enter a valid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  specialInstructions: z.string().optional(),
})

interface Props {
  data: BookingData
  onUpdate: (fields: Partial<BookingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function ContactStep({ data, onUpdate, onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      specialInstructions: data.specialInstructions,
    },
  })

  const onSubmit = (values: any) => {
    onUpdate(values)
    onNext()
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-1">Your Contact Info</h2>
        <p className="text-slate-500 text-sm">We'll use this to confirm your booking and send updates</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="customerName" className="mb-2 block">
            <User className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
            Full Name
          </Label>
          <Input id="customerName" placeholder="Jane Smith" {...register('customerName')} />
          {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
        </div>

        <div>
          <Label htmlFor="customerEmail" className="mb-2 block">
            <Mail className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
            Email Address
          </Label>
          <Input id="customerEmail" type="email" placeholder="jane@example.com" {...register('customerEmail')} />
          {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail.message}</p>}
        </div>

        <div>
          <Label htmlFor="customerPhone" className="mb-2 block">
            <Phone className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
            Phone Number
          </Label>
          <Input id="customerPhone" type="tel" placeholder="(602) 555-1234" {...register('customerPhone')} />
          {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
        </div>

        <div>
          <Label htmlFor="specialInstructions" className="mb-2 block">
            <MessageSquare className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
            Special Instructions <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="specialInstructions"
            placeholder="e.g., Please use fragrance-free products. Gate code is 1234. Focus on the kitchen..."
            rows={4}
            {...register('specialInstructions')}
          />
        </div>

        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Your information is kept secure and private. We'll only use your contact details to coordinate your cleaning appointment and send a confirmation email.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button type="submit" className="flex-1" size="lg">
            Review Booking →
          </Button>
        </div>
      </form>
    </div>
  )
}
