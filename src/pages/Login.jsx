import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { QrCode, Package, Flame, TrendingUp, User, Wrench } from 'lucide-react'

export default function Login() {
    const [correo, setCorreo] = useState('')
    const [contrasena, setContrasena] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setCargando(true)
        setError('')
        try {
            const { data } = await api.post('/auth/login', { correo, contrasena })
            login(data.token, data.usuario)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión')
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Panel izquierdo azul */}
            <div className="hidden lg:flex w-[45%] bg-[#1C3F6E] flex-col items-center justify-center px-12">
                <div className="w-16 h-16 bg-[#F5C400] rounded-2xl flex items-center justify-center mb-6">
                    <div className="w-8 h-8 bg-[#1C3F6E] rounded-lg"></div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Superllanta</h1>
                <p className="text-sm text-white/50 text-center mb-10">Sistema de gestión para vulcanizadora de transporte</p>
                <div className="space-y-4 w-full max-w-xs">
                    {[
                        { Icon: QrCode, title: 'Trazabilidad QR', desc: 'Hoja de vida digital por neumático' },
                        { Icon: Package, title: 'Control de inventario', desc: 'Insumos y neumáticos en tiempo real' },
                        { Icon: Flame, title: 'Servicios', desc: 'Vulcanizados, reencauches y reparaciones' },
                        { Icon: TrendingUp, title: 'Reportes', desc: 'Análisis de servicios e insumos' },
                    ].map(({ Icon, title, desc }) => (
                        <div key={title} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">{title}</p>
                                <p className="text-white/50 text-xs">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel derecho formulario */}
            <div className="flex-1 flex items-center justify-center bg-[#F5F6FA] px-6">
                <div className="w-full max-w-sm">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-[#1A2332] mb-1">Bienvenido</h2>
                        <p className="text-sm text-gray-500 mb-7">Ingresa tus credenciales para continuar</p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Correo electrónico</label>
                                <input
                                    type="email"
                                    value={correo}
                                    onChange={e => setCorreo(e.target.value)}
                                    placeholder="ejemplo@superllanta.com"
                                    className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] focus:ring-2 focus:ring-blue-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Contraseña</label>
                                <input
                                    type="password"
                                    value={contrasena}
                                    onChange={e => setContrasena(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] focus:ring-2 focus:ring-blue-100"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full h-11 bg-[#1C3F6E] hover:bg-[#2563A8] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
                            >
                                {cargando ? 'Ingresando...' : 'Ingresar al sistema'}
                            </button>
                        </form>
                        <div className="flex items-center gap-2 my-4">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-xs text-gray-400">acceso por rol</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 h-9 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50">
                                <User size={14} /> Administrador
                            </div>
                            <div className="flex-1 h-9 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50">
                                <Wrench size={14} /> Técnico
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-5">© 2026 Superllanta · Sistema de gestión v1.0</p>
                </div>
            </div>
        </div>
    )
}