import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../context/authStore'
import { Lock, Mail, Eye, EyeOff, Car } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [seeding, setSeeding]           = useState(false)
  const [seedMsg, setSeedMsg]           = useState('')

  const navigate  = useNavigate()
  const location  = useLocation()
  const { login, isAuthenticated } = useAuthStore()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const handleSeedAdmin = async () => {
    setSeeding(true); setSeedMsg('')
    try {
      const res  = await fetch(`${API_URL}/auth/seed-admin`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setValue('email', data.data.email)
        setValue('password', data.data.password)
        setSeedMsg('Admin creado. Credenciales cargadas.')
      } else {
        setSeedMsg(data.message)
      }
    } catch {
      setSeedMsg('Error al conectar con el servidor.')
    } finally {
      setSeeding(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await login(data)
      if (result.success) {
        toast.success('¡Bienvenido!')
        navigate(from, { replace: true })
      } else {
        toast.error(result.message || 'Error de autenticación')
      }
    } catch {
      toast.error('Error de conexión. Inténtalo más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-slate-900 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center"
               style={{ boxShadow: '0 0 24px rgba(99,102,241,0.5)' }}>
            <Car className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Panel de<br />Administración
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Gestioná usuarios, viajes, pagos y banners desde un solo lugar.
          </p>
        </div>

        <p className="relative text-xs text-slate-600">© 2025 Carpuling Argentina</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Iniciar sesión</h2>
          <p className="text-sm text-slate-500 mb-8">Ingresá con tu cuenta de administrador</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  placeholder="admin@carpuling.com.ar"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' }
                  })}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                  })}
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn btn-primary h-11 text-[15px] font-semibold mt-2">
              {isLoading
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Entrando…</>
                : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <button type="button" onClick={handleSeedAdmin} disabled={seeding}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors">
              {seeding ? 'Creando…' : 'Crear superadmin (setup inicial)'}
            </button>
            {seedMsg && (
              <p className={`text-xs font-mono ${seedMsg.includes('creado') ? 'text-emerald-600' : 'text-red-500'}`}>
                {seedMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
