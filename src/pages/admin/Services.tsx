import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminServices, createAdminService, updateAdminService, deleteAdminService } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit3, Trash2, Loader2, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Required'),
  description: z.string().min(10, 'Description too short'),
  short_description: z.string().optional(),
  price: z.string().min(1, 'Required'),
  duration_minutes: z.string().min(1, 'Required'),
  icon: z.string().min(1, 'Required'),
  features: z.string().optional(),
})

const ICON_OPTIONS = ['home', 'sparkles', 'truck', 'building-2', 'hard-hat', 'sun']
const ICON_EMOJI: Record<string, string> = { home: '🏠', sparkles: '✨', truck: '🚚', 'building-2': '🏢', 'hard-hat': '⚒️', sun: '🪟' }

export default function AdminServices() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const qc = useQueryClient()

  const { data: services, isLoading } = useQuery({ queryKey: ['admin-services'], queryFn: fetchAdminServices })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { icon: 'sparkles', duration_minutes: '120' },
  })

  const openCreate = () => { setEditing(null); reset({ icon: 'sparkles', duration_minutes: '120' }); setModalOpen(true) }
  const openEdit = (svc: any) => {
    setEditing(svc)
    reset({
      name: svc.name, description: svc.description, short_description: svc.short_description || '',
      price: String(svc.price), duration_minutes: String(svc.duration_minutes),
      icon: svc.icon, features: svc.features || '',
    })
    setModalOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: createAdminService,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service created!'); setModalOpen(false) },
    onError: () => toast.error('Failed to create service'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateAdminService(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service updated!'); setModalOpen(false) },
    onError: () => toast.error('Failed to update service'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminService(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const toggleActive = (svc: any) => {
    updateMutation.mutate({ id: svc.id, data: { is_active: !svc.is_active } })
  }

  const onSubmit = (values: any) => {
    const payload = { ...values, price: parseFloat(values.price), duration_minutes: parseInt(values.duration_minutes) }
    if (editing) updateMutation.mutate({ id: editing.id, data: payload })
    else createMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Services</h1>
          <p className="text-slate-500 text-sm">Manage your cleaning service offerings</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Service</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services?.map((svc: any) => (
            <Card key={svc.id} className={`border-0 shadow-sm ${!svc.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ICON_EMOJI[svc.icon] || '✨'}</span>
                    <div>
                      <p className="font-bold text-navy">{svc.name}</p>
                      <Badge variant={svc.is_active ? 'completed' : 'cancelled'} className="text-xs mt-0.5">
                        {svc.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xl font-extrabold text-primary">{formatCurrency(parseFloat(svc.price))}</p>
                </div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{svc.short_description || svc.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{Math.floor(svc.duration_minutes / 60)}h</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(svc)}>
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(svc)}
                    className={svc.is_active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {svc.is_active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => { if (confirm('Delete this service?')) deleteMutation.mutate(svc.id) }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Create Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="mb-1.5 block">Service Name</Label>
                <Input {...register('name')} placeholder="e.g., Deep Cleaning" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block"><DollarSign className="w-3.5 h-3.5 inline mr-1" />Price ($)</Label>
                <Input type="number" step="0.01" {...register('price')} placeholder="120.00" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block"><Clock className="w-3.5 h-3.5 inline mr-1" />Duration (min)</Label>
                <Input type="number" {...register('duration_minutes')} placeholder="120" />
              </div>
              <div className="col-span-2">
                <Label className="mb-1.5 block">Icon</Label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setValue('icon', ic)}
                      className={`px-3 py-2 rounded-lg border-2 text-lg transition-all ${ic === (editing?.icon || 'sparkles') ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                      {ICON_EMOJI[ic]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="mb-1.5 block">Short Description</Label>
                <Input {...register('short_description')} placeholder="One-liner summary" />
              </div>
              <div className="col-span-2">
                <Label className="mb-1.5 block">Full Description</Label>
                <Textarea {...register('description')} rows={3} placeholder="Detailed service description..." />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div className="col-span-2">
                <Label className="mb-1.5 block">Features (JSON array string)</Label>
                <Input {...register('features')} placeholder='["Feature 1", "Feature 2"]' />
                <p className="text-xs text-slate-400 mt-1">JSON format: ["Item 1", "Item 2"]</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Save Changes' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
