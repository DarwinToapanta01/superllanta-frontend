import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Dashboard from '../../pages/Dashboard'
import Insumos from '../../pages/Insumos'
import Clientes from '../../pages/Clientes'
import Vulcanizados from '../../pages/Vulcanizados'
import Reparaciones from '../../pages/Reparaciones'
import Reencauches from '../../pages/Reencauches'
import Trazabilidad from '../../pages/Trazabilidad'
import Usuarios from '../../pages/Usuarios'
import Neumaticos from '../../pages/Neumaticos'
import Reportes from '../../pages/Reportes'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
    const { logout } = useAuth()
    const [fueraHorario, setFueraHorario] = useState(null)

    useEffect(() => {
        const handler = (e) => setFueraHorario(e.detail)
        window.addEventListener('fuera-horario', handler)
        return () => window.removeEventListener('fuera-horario', handler)
    }, [])

    if (fueraHorario) {
        return (
            <div className="min-h-screen bg-[#1C3F6E] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={28} className="text-orange-500" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1A2332] mb-2">Fuera de horario</h2>
                    <p className="text-sm text-gray-500 mb-4">{fueraHorario.mensaje}</p>
                    <div className="bg-[#1C3F6E] rounded-xl px-4 py-3 text-white text-sm font-semibold">
                        {fueraHorario.horario}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4">
                        Si necesitas acceso urgente, contacta al administrador del sistema.
                    </p>
                    <button
                        onClick={logout}
                        className="w-full h-10 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-[#F5F6FA]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-5">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/insumos" element={<Insumos />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/vulcanizados" element={<Vulcanizados />} />
                        <Route path="/reparaciones" element={<Reparaciones />} />
                        <Route path="/reencauches" element={<Reencauches />} />
                        <Route path="/trazabilidad" element={<Trazabilidad />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                        <Route path="/neumaticos" element={<Neumaticos />} />
                        <Route path="/reportes" element={<Reportes />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}