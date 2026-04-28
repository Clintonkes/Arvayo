import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Building2, Mail, Phone, Globe, Shield, User, Lock, Info } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: fetchMe })

  const handleSave = () => toast.success('Settings saved (update via .env file in production)')

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Settings</h1>
        <p className="text-slate-500 text-sm">Manage company info and admin preferences</p>
      </div>

      {/* Admin Account */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Admin Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">
              {me?.full_name?.[0] || 'A'}
            </div>
            <div>
              <p className="font-semibold text-navy">{me?.full_name}</p>
              <p className="text-sm text-slate-500">{me?.email}</p>
              <Badge className="mt-1 text-xs" variant="completed">Active</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Full Name</Label>
              <Input defaultValue={me?.full_name} readOnly className="bg-slate-50" />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input defaultValue={me?.email} readOnly className="bg-slate-50" />
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700">To update account credentials, modify the database directly or use the seed script.</p>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Company Information</CardTitle>
          </div>
          <CardDescription>These settings are configured via environment variables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block"><Building2 className="w-3.5 h-3.5 inline mr-1.5" />Company Name</Label>
              <Input defaultValue="Arvayo LLC" readOnly className="bg-slate-50" />
            </div>
            <div>
              <Label className="mb-1.5 block"><Phone className="w-3.5 h-3.5 inline mr-1.5" />Phone Number</Label>
              <Input defaultValue="+1 (602) 583-8563" readOnly className="bg-slate-50" />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block"><Mail className="w-3.5 h-3.5 inline mr-1.5" />Email Address</Label>
              <Input defaultValue="arvayollc@proton.me" readOnly className="bg-slate-50" />
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">
              <strong>To update:</strong> Edit the <code className="bg-amber-100 px-1 rounded">.env</code> file in the backend directory, then restart the server.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Config */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Email Configuration (SMTP)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">SMTP Host</Label>
              <Input defaultValue="smtp.protonmail.ch" readOnly className="bg-slate-50 font-mono text-sm" />
            </div>
            <div>
              <Label className="mb-1.5 block">SMTP Port</Label>
              <Input defaultValue="587" readOnly className="bg-slate-50 font-mono text-sm" />
            </div>
            <div>
              <Label className="mb-1.5 block">From Email</Label>
              <Input defaultValue="arvayollc@proton.me" readOnly className="bg-slate-50 font-mono text-sm" />
            </div>
            <div>
              <Label className="mb-1.5 block">From Name</Label>
              <Input defaultValue="Arvayo LLC" readOnly className="bg-slate-50 font-mono text-sm" />
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              For Proton Mail, use the Proton Mail Bridge app to get SMTP credentials. Configure <code className="bg-blue-100 px-1 rounded">SMTP_PASSWORD</code> in your <code className="bg-blue-100 px-1 rounded">.env</code> file.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-navy">JWT Authentication</p>
              <p className="text-xs text-slate-500">Admin session expires after 24 hours</p>
            </div>
            <Badge variant="completed">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-navy">Password Hashing</p>
              <p className="text-xs text-slate-500">bcrypt with salt rounds</p>
            </div>
            <Badge variant="completed">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-navy">CORS Protection</p>
              <p className="text-xs text-slate-500">Configured for frontend origin only</p>
            </div>
            <Badge variant="completed">Active</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}
