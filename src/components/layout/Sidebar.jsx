import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard, Package, Truck, Wrench, Flame,
    RefreshCw, QrCode, Users, BarChart2, UserCog, LogOut
} from 'lucide-react'

export default function Sidebar() {
    const { usuario, logout } = useAuth()
    const esAdmin = usuario?.rol === 'administrador'
    const iniciales = `${usuario?.nombre?.[0] || ''}${usuario?.apellido?.[0] || ''}`.toUpperCase()

    const navItems = [
        {
            seccion: 'Principal',
            items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }]
        },
        {
            seccion: 'Inventario',
            items: [
                { to: '/insumos', icon: Package, label: 'Insumos' },
                { to: '/neumaticos', icon: Truck, label: 'Neumáticos' },
            ]
        },
        {
            seccion: 'Servicios',
            items: [
                { to: '/reparaciones', icon: Wrench, label: 'Reparaciones' },
                { to: '/vulcanizados', icon: Flame, label: 'Vulcanizados' },
                { to: '/reencauches', icon: RefreshCw, label: 'Reencauches' },
                { to: '/trazabilidad', icon: QrCode, label: 'Trazabilidad QR' },
            ]
        },
        {
            seccion: 'Gestión',
            items: [
                { to: '/clientes', icon: Users, label: 'Clientes' },
                ...(esAdmin ? [
                    { to: '/reportes', icon: BarChart2, label: 'Reportes' },
                    { to: '/usuarios', icon: UserCog, label: 'Usuarios' },
                ] : []),
            ]
        }, ,
    ]

    return (
        <aside className="w-[210px] bg-[#1C3F6E] flex flex-col flex-shrink-0 h-screen overflow-hidden">
            <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
                <div className="text-[#F5C400] font-bold text-base flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#F5C400] rounded-md flex items-center justify-center">
                        <div className="w-3 h-3 bg-[#1C3F6E] rounded-sm"></div>
                    </div>
                    Superllanta
                </div>
                <div className="text-white/40 text-[10px] mt-0.5 pl-8">Sistema de gestión</div>
            </div>

            <nav className="flex-1 py-2 overflow-hidden">
                {navItems.map(({ seccion, items }) => (
                    <div key={seccion} className="mb-1">
                        <div className="text-white/30 text-[9px] font-semibold uppercase tracking-widest px-4 py-1">
                            {seccion}
                        </div>
                        {items.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-4 py-2 text-xs cursor-pointer transition-colors ${isActive
                                        ? 'bg-[#F5C400]/15 text-[#F5C400] border-l-[3px] border-[#F5C400]'
                                        : 'text-white/60 hover:bg-white/7 hover:text-white border-l-[3px] border-transparent'
                                    }`
                                }
                            >
                                <Icon size={14} strokeWidth={1.8} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="border-t border-white/10 px-4 py-3 flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#F5C400] flex items-center justify-center text-[11px] font-bold text-[#1C3F6E] flex-shrink-0">
                    {iniciales}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">{usuario?.nombre}</div>
                    <div className="text-white/40 text-[9px] capitalize">{usuario?.rol}</div>
                </div>
                <button onClick={logout} title="Cerrar sesión"
                    className="text-white/30 hover:text-white transition-colors p-1 rounded">
                    <LogOut size={13} />
                </button>
            </div>
        </aside>
    )
}