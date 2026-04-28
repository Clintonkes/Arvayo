import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, Mail, MapPin, Clock, CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const FAQ_ITEMS = [
  {
    q: 'How do I book a cleaning service?',
    a: 'Simply click "Book Now" on our website, choose your service, pick a date and time, enter your property details and contact information, then confirm your booking. You\'ll receive an email confirmation immediately.',
  },
  {
    q: 'What areas do you serve?',
    a: 'We serve the Greater Phoenix, AZ area including Scottsdale, Tempe, Chandler, Gilbert, Mesa, and surrounding communities. Contact us if you\'re unsure whether we cover your location.',
  },
  {
    q: 'Do I need to be home during the cleaning?',
    a: 'No, you don\'t need to be home. Many clients provide a key or entry code. Our team is fully background-checked and insured for your peace of mind.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Cancellations made 24+ hours before the appointment are free of charge. Late cancellations or no-shows may be subject to a fee. Please call us as early as possible if you need to reschedule.',
  },
  {
    q: 'Are your cleaning products safe for pets and children?',
    a: 'Yes. We use eco-friendly, non-toxic cleaning products that are safe for families and pets. Just let us know about any specific sensitivities when booking.',
  },
  {
    q: 'Do you offer recurring cleaning services?',
    a: 'Absolutely! We offer weekly, bi-weekly, and monthly cleaning plans at a discounted rate. Contact us to set up a recurring schedule.',
  },
]

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    // In production this would POST to /api/contact — for now open mailto
    await new Promise(r => setTimeout(r, 800))
    const subject = encodeURIComponent(`[Arvayo LLC] ${data.subject}`)
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\n${data.message}`
    )
    window.location.href = `mailto:arvayollc@proton.me?subject=${subject}&body=${body}`
    toast.success("Opening your email client — we'll respond within 24 hours!")
    setSubmitted(true)
    reset()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Get in Touch</p>
          <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/75 max-w-xl mx-auto">
            Have a question, need a custom quote, or want to schedule a recurring service? We're here to help.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-navy mb-4">Reach Us Directly</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Phone', value: '+1 (602) 583-8563', href: 'tel:+16025838563' },
                  { icon: Mail, label: 'Email', value: 'arvayollc@proton.me', href: 'mailto:arvayollc@proton.me' },
                  { icon: MapPin, label: 'Service Area', value: 'Greater Phoenix, AZ', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
                      {href ? (
                        <a href={href} className="text-navy font-semibold hover:text-primary transition-colors">{value}</a>
                      ) : (
                        <p className="text-navy font-semibold">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-sm bg-primary/5 border border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-navy text-sm">Business Hours</p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monday – Saturday</span>
                    <span className="font-semibold text-navy">7:00 AM – 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sunday</span>
                    <span className="font-semibold text-navy">8:00 AM – 5:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm font-semibold text-emerald-800 mb-1">⚡ Same-Day Availability</p>
              <p className="text-xs text-emerald-700">Call us for same-day or next-day bookings. We'll do our best to accommodate urgent requests.</p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-7">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-navy">Send Us a Message</h2>
                </div>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald/10 border-4 border-emerald flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald" />
                    </div>
                    <h3 className="text-xl font-bold text-navy">Message Sent!</h3>
                    <p className="text-slate-500 max-w-sm">Your email client has opened with your message pre-filled. We'll respond within 24 hours.</p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">Send Another Message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-1.5 block">Full Name *</Label>
                        <Input placeholder="Jane Smith" {...register('name')} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <Label className="mb-1.5 block">Email Address *</Label>
                        <Input type="email" placeholder="jane@example.com" {...register('email')} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-1.5 block">Phone <span className="text-slate-400 font-normal">(optional)</span></Label>
                        <Input type="tel" placeholder="(602) 555-0123" {...register('phone')} />
                      </div>
                      <div>
                        <Label className="mb-1.5 block">Subject *</Label>
                        <Input placeholder="Custom quote, recurring service, etc." {...register('subject')} />
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-1.5 block">Message *</Label>
                      <Textarea
                        rows={5}
                        placeholder="Tell us about your needs — property type, size, special requirements, preferred schedule..."
                        {...register('message')}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send Message →'}
                    </Button>
                    <p className="text-center text-xs text-slate-400">
                      Or call us directly at{' '}
                      <a href="tel:+16025838563" className="text-primary font-semibold hover:underline">(602) 583-8563</a>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Support</p>
            <h2 className="text-3xl font-extrabold text-navy">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FAQ_ITEMS.map((item) => (
              <Card key={item.q} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <p className="font-semibold text-navy mb-2 text-sm">{item.q}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
