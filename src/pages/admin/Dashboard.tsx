import { useQuery } from '@tanstack/react-query'
import { fetchMetrics, fetchAdminOrders } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { CalendarCheck2, DollarSign, Clock, Package, ArrowRight, TrendingUp, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

const STATUS_COLOR: Record<string, any> = {
  pending: 'pending', confirmed: 'confirmed', in_progress: 'in_progress',
  completed: 'completed', cancelled: 'cancelled',
}
const PIE_COLORS = ['#00C4B4', '#0A2540', '#10B981', '#6366f1', '#f59e0b', '#ef4444']

export default function AdminDashboard() {
  const { data: metrics, isLoading } = useQuery({ queryKey: ['metrics'], queryFn: fetchMetrics })
  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders', { limit: 5 }],
    queryFn: () => fetchAdminOrders({ limit: 5 }),
  })

  const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-navy">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Dashboard</h1>
        <p className="text-slate-500 text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck2} label="Today's Bookings" value={metrics?.today_bookings ?? 0} sub="Scheduled for today" color="bg-blue-100 text-blue-600" />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={formatCurrency(metrics?.monthly_revenue ?? 0)} sub="Confirmed + Completed" color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Clock} label="Pending Jobs" value={metrics?.pending_jobs ?? 0} sub="Awaiting confirmation" color="bg-amber-100 text-amber-600" />
        <StatCard icon={Package} label="Total Orders" value={metrics?.total_orders ?? 0} sub="All time" color="bg-purple-100 text-purple-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <Card className="xl:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-semibold">Booking Trends (6 Months)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics?.monthly_trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any, name: string) => [name === 'revenue' ? formatCurrency(v) : v, name === 'revenue' ? 'Revenue' : 'Bookings']} />
                <Bar yAxisId="left" dataKey="bookings" fill="#00C4B4" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="#0A2540" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by service */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={(metrics?.revenue_by_service ?? []).filter((s: any) => s.revenue > 0)}
                  dataKey="revenue"
                  nameKey="service"
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  label={false}
                >
                  {(metrics?.revenue_by_service ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Button asChild size="sm" variant="ghost">
            <Link to="/admin/orders">View all <ArrowRight className="w-3 h-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ordersData?.items?.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {order.customer_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{order.customer_name}</p>
                    <p className="text-xs text-slate-400">{order.order_number} · {order.service?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-navy">{formatCurrency(parseFloat(order.total_price))}</p>
                    <p className="text-xs text-slate-400">{formatDate(order.scheduled_date)}</p>
                  </div>
                  <Badge variant={STATUS_COLOR[order.status] || 'default'}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
            {(!ordersData?.items || ordersData.items.length === 0) && (
              <p className="text-center text-slate-400 text-sm py-8">No orders yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
