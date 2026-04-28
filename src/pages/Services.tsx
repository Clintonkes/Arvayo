import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchServices } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const ICON_MAP: Record<string, string> = {
  home: '🏠', sparkles: '✨', truck: '🚚', 'building-2': '🏢', 'hard-hat': '⚒️', sun: '🪟',
}

export default function Services() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Professional Services</p>
          <h1 className="text-5xl font-extrabold mb-4">Our Cleaning Services</h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto mb-8">
            From standard maintenance to deep cleans, we offer comprehensive cleaning solutions for every home and business.
          </p>
          <Button asChild size="xl">
            <Link to="/book">Book a Service <ArrowRight className="w-5 h-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {services?.map((svc: any) => {
                const features: string[] = svc.features ? JSON.parse(svc.features) : []
                return (
                  <Card key={svc.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden">
                    {/* Top accent */}
                    <div className="h-1.5 bg-gradient-to-r from-primary to-emerald" />
                    <CardContent className="p-7">
                      {/* Icon & Price */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="text-5xl">{ICON_MAP[svc.icon] || '✨'}</div>
                        <div className="text-right">
                          <p className="text-3xl font-extrabold text-primary">{formatCurrency(parseFloat(svc.price))}</p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-400">~{Math.floor(svc.duration_minutes / 60)}h {svc.duration_minutes % 60 > 0 ? `${svc.duration_minutes % 60}min` : ''}</span>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-navy mb-2">{svc.name}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-5">{svc.description}</p>

                      {features.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">What's Included</p>
                          <ul className="space-y-2">
                            {features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button asChild className="w-full">
                        <Link to={`/book?service=${svc.id}`}>
                          Book This Service <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-navy mb-3">Not Sure Which Service You Need?</h2>
          <p className="text-slate-500 mb-6">Give us a call and our team will help you choose the best option for your home.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/book">Book Online</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="tel:+16025838563">Call (602) 583-8563</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
