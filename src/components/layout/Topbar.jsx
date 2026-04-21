import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

const titulos = {
    '/dashboard': 'Dashboard',
    '/insumos': 'Inventario de insumos',
    '/neumaticos': 'Neumáticos en venta',
    '/reparaciones': 'Reparaciones y cambios',
    '/vulcanizados': 'Vulcanizados',
    '/reencauches': 'Reencauches',
    '/trazabilidad': 'Trazabilidad QR',
    '/clientes': 'Clientes',
    '/reportes': 'Reportes',
    '/usuarios': 'Usuarios',
}

export default function Topbar() {
    const { pathname } = useLocation()
    const titulo = titulos[pathname] || 'Superllanta'
    const fecha = new Date().toLocaleDateString('es-EC', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })

    return (
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0">
            <h1 className="text-sm font-semibold text-[#1A2332]">{titulo}</h1>
            <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded capitalize">
                    {fecha}
                </span>
                <button className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Bell size={14} className="text-gray-500" />
                </button>
            </div>
        </header>
    )
}