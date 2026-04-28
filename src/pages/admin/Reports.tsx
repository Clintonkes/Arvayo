import { useQuery } from '@tanstack/react-query'
import { fetchMetrics, exportOrdersCsv } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Download, TrendingUp, DollarSign, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const PIE_COLORS = ['#00C4B4', '#0A2540', '#10B981', '#6366f1', '#f59e0b', '#ef4444']

export default function AdminReports() {
  const { data: metrics, isLoading } = useQuery({ queryKey: ['metrics'], queryFn: fetchMetrics })

  const handleExport = async () => {
    try {
      const blob = await exportOrdersCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arvayo_orders_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exported successfully!')
    } catch {
      toast.error('Export failed')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
  }

  const totalRevenue = metrics?.monthly_trend?.reduce((s: number, m: any) => s + m.revenue, 0) ?? 0
  const totalBookings = metrics?.monthly_trend?.reduce((s: number, m: any) => s + m.bookings, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm">Business performance overview</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-teal-50">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 mb-1">6-Month Revenue</p>
            <p className="text-3xl font-extrabold text-primary">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 mb-1">Total Bookings (6mo)</p>
            <p className="text-3xl font-extrabold text-navy">{totalBookings}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 mb-1">Avg Revenue / Booking</p>
            <p className="text-3xl font-extrabold text-navy">{formatCurrency(totalBookings > 0 ? totalRevenue / totalBookings : 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-base font-semibold">Revenue Trend (6 Months)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={metrics?.monthly_trend ?? []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C4B4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C4B4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#00C4B4" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly bookings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics?.monthly_trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#0A2540" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by service */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-semibold">Revenue by Service</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {(metrics?.revenue_by_service ?? []).filter((s: any) => s.revenue > 0).length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-sm">No revenue data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={(metrics?.revenue_by_service ?? []).filter((s: any) => s.revenue > 0)}
                      dataKey="revenue"
                      nameKey="service"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                    >
                      {(metrics?.revenue_by_service ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {(metrics?.revenue_by_service ?? []).map((s: any, i: number) => (
                    <div key={s.service} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600 truncate max-w-[160px]">{s.service}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-xs">{s.bookings} jobs</span>
                        <span className="font-semibold text-navy">{formatCurrency(s.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
