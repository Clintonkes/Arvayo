import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Sparkles, Phone } from 'lucide-react'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-navy text-lg leading-tight">Arvayo LLC</span>
              <p className="text-xs text-slate-400 leading-tight hidden sm:block">Professional Cleaning</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === l.href
                    ? 'text-primary'
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+16025838563" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              (602) 583-8563
            </a>
            <Button asChild size="sm">
              <Link to="/book">Book Now</Link>
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="block text-sm font-medium text-slate-700 hover:text-primary py-2 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <a href="tel:+16025838563" className="flex items-center gap-2 text-sm text-slate-600 py-2 mb-2">
                <Phone className="w-4 h-4 text-primary" />
                (602) 583-8563
              </a>
              <Button asChild className="w-full" onClick={() => setOpen(false)}>
                <Link to="/book">Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
