import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminLogin } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function AdminLogin() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@arvayollc.com', password: '' },
  })

  const onSubmit = async (values: any) => {
    setLoading(true)
    try {
      const data = await adminLogin(values.email, values.password)
      localStorage.setItem('arvayo_admin_token', data.access_token)
      toast.success('Welcome back!')
      navigate('/admin/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4 shadow-2xl shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Arvayo LLC</h1>
          <p className="text-white/60 text-sm">Admin Dashboard</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-navy">Sign In</CardTitle>
            <CardDescription>Access the admin control panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  <Mail className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                  Email Address
                </Label>
                <Input id="email" type="email" {...register('email')} autoComplete="email" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block">
                  <Lock className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    autoComplete="current-password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-primary transition-colors p-1 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In to Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/50 text-sm mt-6">
          <Link to="/" className="hover:text-white transition-colors">← Back to website</Link>
        </p>
      </div>
    </div>
  )
}
