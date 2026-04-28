import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchServices } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2, Star, Phone, ArrowRight, Sparkles, Shield, Clock,
  Award, Users, ThumbsUp, ChevronRight, CalendarCheck2, Home, Zap
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const ICON_MAP: Record<string, string> = {
  home: '🏠', sparkles: '✨', truck: '🚚', 'building-2': '🏢', 'hard-hat': '⚒️', sun: '🪟',
}

const TESTIMONIALS = [
  { name: 'Sarah M.', location: 'Phoenix, AZ', rating: 5, text: 'Arvayo LLC transformed my home! They were punctual, thorough, and used eco-friendly products. My house has never been this clean. Highly recommend!' },
  { name: 'James R.', location: 'Scottsdale, AZ', rating: 5, text: 'Outstanding service from start to finish. The online booking was super easy and the team arrived right on time. Will definitely book again!' },
  { name: 'Maria T.', location: 'Tempe, AZ', rating: 5, text: 'Used them for a move-out clean and got my full deposit back! The attention to detail was incredible. Worth every penny.' },
]

const STEPS = [
  { icon: CalendarCheck2, title: 'Book Online', desc: 'Choose your service, date, and time in minutes through our easy booking wizard.' },
  { icon: Sparkles, title: 'We Clean', desc: 'Our certified, background-checked cleaners arrive fully equipped and ready to work.' },
  { icon: ThumbsUp, title: 'Enjoy Your Space', desc: 'Relax in a spotless home. 100% satisfaction guaranteed or we re-clean for free.' },
]

const TRUST_BADGES = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Users, label: 'Background Checked' },
  { icon: Award, label: '100% Satisfaction' },
  { icon: Zap, label: 'Same-Day Available' },
]

export default function Landing() {
  const { data: services } = useQuery({ queryKey: ['services'], queryFn: fetchServices })

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              Professional Cleaning Services You Can Trust
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-white">Arvayo</span>
              <span className="text-primary"> LLC</span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white/90">Clean Home, Clear Mind</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
              Phoenix's most trusted cleaning service. Licensed, insured, and background-checked professionals dedicated to making your space spotless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="xl" className="gradient-teal shadow-2xl shadow-primary/30">
                <Link to="/book">
                  Book Now – It's Free <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm">
                <a href="tel:+16025838563">
                  <Phone className="w-5 h-5" /> (602) 583-8563
                </a>
              </Button>
            </div>
            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
              {[['500+', 'Homes Cleaned'], ['4.9★', 'Average Rating'], ['100%', 'Satisfaction Rate'], ['5+', 'Years Experience']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-3xl font-extrabold text-primary">{val}</p>
                  <p className="text-sm text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-slate-600">
                <b.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-4xl font-extrabold text-navy mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Getting a clean home has never been easier. Book in under 2 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-9 h-9 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block w-6 h-6 text-slate-300 absolute right-0 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link to="/book">Book Your Clean Now <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Services</p>
            <h2 className="text-4xl font-extrabold text-navy mb-4">Cleaning For Every Need</h2>
            <p className="text-slate-500 max-w-xl mx-auto">From regular maintenance to deep cleans, we have you covered.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services || []).slice(0, 6).map((svc: any) => (
              <Card key={svc.id} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{ICON_MAP[svc.icon] || '✨'}</div>
                  <h3 className="text-lg font-bold text-navy mb-2">{svc.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{svc.short_description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-primary">
                      {formatCurrency(parseFloat(svc.price))}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/book">Book Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/services">View All Services <ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Customer Reviews</p>
            <h2 className="text-4xl font-extrabold text-navy mb-4">What Our Customers Say</h2>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-slate-500">4.9 average from 200+ reviews</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 gradient-teal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Home className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-4xl font-extrabold mb-4">Ready for a Spotless Home?</h2>
          <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
            Book your cleaning appointment today and experience the Arvayo LLC difference. No hidden fees, no contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl" variant="navy" className="bg-white text-navy hover:bg-white/90 shadow-xl">
              <Link to="/book">
                Book My Cleaning <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/50 text-white hover:bg-white/10">
              <a href="tel:+16025838563">
                <Phone className="w-5 h-5" /> Call (602) 583-8563
              </a>
            </Button>
          </div>
          <p className="text-white/70 text-sm mt-6 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 100% Satisfaction Guaranteed · No Hidden Fees · Free Re-clean Policy
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
