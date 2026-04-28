import { Link } from 'react-router-dom'
import { Sparkles, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl">Arvayo LLC</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Professional Cleaning Services You Can Trust. Licensed, insured, and committed to excellence in every clean.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary transition-colors flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Services</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {['Standard House Cleaning', 'Deep Cleaning', 'Move-In / Move-Out', 'Commercial Cleaning', 'Post-Construction', 'Window Cleaning'].map((s) => (
                <li key={s}>
                  <Link to="/services" className="hover:text-primary transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">All Services</Link></li>
              <li><Link to="/book" className="hover:text-primary transition-colors">Book Now</Link></li>
              <li><Link to="/admin/login" className="hover:text-primary transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <a href="tel:+16025838563" className="flex items-start gap-3 hover:text-primary transition-colors group">
                  <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  +1 (602) 583-8563
                </a>
              </li>
              <li>
                <a href="mailto:arvayollc@proton.me" className="flex items-start gap-3 hover:text-primary transition-colors group">
                  <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  arvayollc@proton.me
                </a>
              </li>
              <li>
                <span className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  Serving the Greater Phoenix, AZ Area
                </span>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-xs text-slate-300"><span className="text-primary font-semibold">Mon–Sat:</span> 7:00 AM – 7:00 PM</p>
              <p className="text-xs text-slate-300 mt-1"><span className="text-primary font-semibold">Sunday:</span> 8:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 Arvayo LLC. All rights reserved.</p>
          <p className="text-slate-500 text-sm">Professional Cleaning Services You Can Trust</p>
        </div>
      </div>
    </footer>
  )
}
