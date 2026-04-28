import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookingData } from '../BookingWizard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, MapPin, Minus, Plus } from 'lucide-react'

const schema = z.object({
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  propertySqft: z.string().optional(),
})

interface Props {
  data: BookingData
  onUpdate: (fields: Partial<BookingData>) => void
  onNext: () => void
  onBack: () => void
}

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export default function PropertyStep({ data, onUpdate, onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      propertySqft: data.propertySqft,
    },
  })

  const onSubmit = (values: any) => {
    onUpdate(values)
    onNext()
  }

  const Counter = ({ label, value, field }: { label: string; value: number; field: 'numBedrooms' | 'numBathrooms' }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onUpdate({ [field]: Math.max(1, value - 1) })}
          className="cursor-pointer w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center font-bold text-navy">{value}</span>
        <button
          type="button"
          onClick={() => onUpdate({ [field]: Math.min(10, value + 1) })}
          className="cursor-pointer w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-1">Property Details</h2>
        <p className="text-slate-500 text-sm">Tell us about your property so we can prepare</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Address */}
        <div>
          <Label htmlFor="address" className="mb-2 block">
            <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
            Street Address
          </Label>
          <Input id="address" placeholder="123 Main Street" {...register('address')} />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-1">
            <Label htmlFor="city" className="mb-2 block">City</Label>
            <Input id="city" placeholder="Phoenix" {...register('city')} />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <Label htmlFor="state" className="mb-2 block">State</Label>
            <select
              id="state"
              defaultValue={data.state}
              {...register('state')}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">State</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
          </div>
          <div>
            <Label htmlFor="zipCode" className="mb-2 block">ZIP Code</Label>
            <Input id="zipCode" placeholder="85001" {...register('zipCode')} maxLength={5} />
            {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="sqft" className="mb-2 block">Square Footage <span className="text-slate-400 font-normal">(optional)</span></Label>
          <Input id="sqft" type="number" placeholder="e.g., 1500" {...register('propertySqft')} />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Property Size</p>
          <Counter label="Bedrooms" value={data.numBedrooms} field="numBedrooms" />
          <Counter label="Bathrooms" value={data.numBathrooms} field="numBathrooms" />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer" onClick={() => onUpdate({ hasPets: !data.hasPets })}>
          <Checkbox id="pets" checked={data.hasPets} onCheckedChange={(v) => onUpdate({ hasPets: !!v })} />
          <div>
            <Label htmlFor="pets" className="cursor-pointer font-medium">We have pets 🐾</Label>
            <p className="text-xs text-slate-500 mt-0.5">Our team will take extra care with pet-safe products</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button type="submit" className="flex-1" size="lg">
            Continue →
          </Button>
        </div>
      </form>
    </div>
  )
}
