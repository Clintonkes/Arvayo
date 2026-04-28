import { ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMe } from '@/lib/api'

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('arvayo_admin_token')
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }
    fetchMe()
      .then(() => setChecking(false))
      .catch(() => {
        localStorage.removeItem('arvayo_admin_token')
        navigate('/admin/login', { replace: true })
      })
  }, [navigate])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Verifying access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
