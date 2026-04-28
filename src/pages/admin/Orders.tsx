import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminOrders, updateOrderStatus, deleteOrder } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Trash2, Edit3, Eye, Loader2, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
const STATUS_VARIANT: Record<string, any> = {
  pending: 'pending', confirmed: 'confirmed', in_progress: 'in_progress',
  completed: 'completed', cancelled: 'cancelled',
}

export default function AdminOrders() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const limit = 15
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { search, status: statusFilter, skip: page * limit, limit }],
    queryFn: () => fetchAdminOrders({ search: search || undefined, status: statusFilter || undefined, skip: page * limit, limit }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status updated') },
    onError: () => toast.error('Failed to update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order deleted') },
    onError: () => toast.error('Failed to delete order'),
  })

  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Orders</h1>
          <p className="text-slate-500 text-sm">{total} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or order number..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(0) }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : data?.items?.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Service</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items?.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-primary">{order.order_number}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-navy text-sm">{order.customer_name}</p>
                          <p className="text-xs text-slate-400">{order.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-slate-600">{order.service?.name}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div>
                          <p className="text-sm text-slate-700">{formatDate(order.scheduled_date)}</p>
                          <p className="text-xs text-slate-400">{formatTime(order.scheduled_time)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-navy">{formatCurrency(parseFloat(order.total_price))}</span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => statusMutation.mutate({ id: order.id, status: v })}
                        >
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <Badge variant={STATUS_VARIANT[order.status]} className="text-xs">
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(s => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm('Delete this order?')) deleteMutation.mutate(order.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">Page {page + 1} of {totalPages} ({total} orders)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary">{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Customer</p>
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                  <p className="text-slate-500">{selectedOrder.customer_email}</p>
                  <p className="text-slate-500">{selectedOrder.customer_phone}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Service</p>
                  <p className="font-semibold">{selectedOrder.service?.name}</p>
                  <p className="text-primary font-bold">{formatCurrency(parseFloat(selectedOrder.total_price))}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Appointment</p>
                <p className="font-semibold">{formatDate(selectedOrder.scheduled_date)} at {formatTime(selectedOrder.scheduled_time)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Address</p>
                <p className="font-semibold">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} {selectedOrder.zip_code}</p>
                <p className="text-slate-500">{selectedOrder.num_bedrooms} bed / {selectedOrder.num_bathrooms} bath{selectedOrder.has_pets ? ' · Pets' : ''}</p>
              </div>
              {selectedOrder.special_instructions && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <p className="text-xs text-amber-600 font-semibold mb-1">Special Instructions</p>
                  <p className="text-amber-800">{selectedOrder.special_instructions}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
