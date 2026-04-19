import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
    { seccion: 'Principal', items: [{ to: '/dashboard', icon: '◉', label: 'Dashboard' }] },
    {
        seccion: 'Inventario', items: [
            { to: '/insumos', icon: '📦', label: 'Insumos' },
            { to: '/neumaticos', icon: '🚛', label: 'Neumáticos' },
        ]
    },
    {
        seccion: 'Servicios', items: [
            { to: '/reparaciones', icon: '🔧', label: 'Reparaciones' },
            { to: '/vulcanizados', icon: '🔥', label: 'Vulcanizados' },
            { to: '/reencauches', icon: '♻️', label: 'Reencauches' },
            { to: '/trazabilidad', icon: '⬛', label: 'Trazabilidad QR' },
        ]
    },
    {
        seccion: 'Gestión', items: [
            { to: '/clientes', icon: '👥', label: 'Clientes' },
            { to: '/reportes', icon: '📈', label: 'Reportes' },
            { to: '/usuarios', icon: '👤', label: 'Usuarios' },
        ]
    },
]

export default function Sidebar() {
    const { usuario, logout } = useAuth()
    const iniciales = `${usuario?.nombre?.[0] || ''}${usuario?.apellido?.[0] || ''}`.toUpperCase()

    return (
        <aside className="w-[210px] bg-[#1C3F6E] flex flex-col flex-shrink-0">
            {/* Logo */}
            <div className="px-4 py-4 border-b border-white/10">
                <div className="text-[#F5C400] font-bold text-base">⬡ Superllanta</div>
                <div className="text-white/40 text-[10px] mt-0.5">Sistema de gestión</div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 py-3 overflow-y-auto">
                {navItems.map(({ seccion, items }) => (
                    <div key={seccion} className="mb-2">
                        <div className="text-white/30 text-[9px] font-semibold uppercase tracking-widest px-4 py-1">{seccion}</div>
                        {items.map(({ to, icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 text-xs cursor-pointer transition-colors ${isActive
                                        ? 'bg-[#F5C400]/15 text-[#F5C400] border-l-[3px] border-[#F5C400]'
                                        : 'text-white/60 hover:bg-white/7 hover:text-white'
                                    }`
                                }
                            >
                                <span className="text-sm w-4 text-center">{icon}</span>
                                {label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Usuario */}
            <div className="border-t border-white/10 px-4 py-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F5C400] flex items-center justify-center text-[11px] font-bold text-[#1C3F6E] flex-shrink-0">
                    {iniciales}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">{usuario?.nombre}</div>
                    <div className="text-white/40 text-[9px] capitalize">{usuario?.rol}</div>
                </div>
                <button onClick={logout} title="Cerrar sesión" className="text-white/30 hover:text-white text-sm">↩</button>
            </div>
        </aside>
    )
}