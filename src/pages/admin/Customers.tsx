import { useQuery } from '@tanstack/react-query'
import { fetchCustomers } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Phone, Loader2, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export default function AdminCustomers() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: fetchCustomers,
  })

  const totalRevenue = (customers ?? []).reduce((s: number, c: any) => s + c.total_spent, 0)
  const totalBookings = (customers ?? []).reduce((s: number, c: any) => s + c.total_orders, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Customers</h1>
        <p className="text-slate-500 text-sm">All customers aggregated from booking history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Customers</p>
              <p className="text-2xl font-extrabold text-navy">{customers?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Bookings</p>
              <p className="text-2xl font-extrabold text-navy">{totalBookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">$</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-extrabold text-navy">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Customer Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : !customers?.length ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No customers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Bookings</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Booking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c: any) => (
                    <TableRow key={c.customer_email} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {c.customer_name[0].toUpperCase()}
                          </div>
                          <p className="font-semibold text-navy text-sm">{c.customer_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <a
                            href={`mailto:${c.customer_email}`}
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <Mail className="w-3 h-3" /> {c.customer_email}
                          </a>
                          <a
                            href={`tel:${c.customer_phone}`}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
                          >
                            <Phone className="w-3 h-3" /> {c.customer_phone}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={c.total_orders >= 3 ? 'completed' : 'confirmed'} className="text-xs">
                          {c.total_orders} {c.total_orders === 1 ? 'booking' : 'bookings'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-navy">
                        {formatCurrency(c.total_spent)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-slate-500">
                        {format(new Date(c.last_order), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
