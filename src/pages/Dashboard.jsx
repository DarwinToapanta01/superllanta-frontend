import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard'
import { useAuth } from '../context/AuthContext'
import GraficaTendencias from '../components/dashboard/GraficaTendencias'
import Spinner from '../components/ui/Spinner'
import {
    Flame, RefreshCw, Wrench, Users, QrCode,
    AlertTriangle, Clock, TrendingUp, Activity,
    CheckCircle, UserCog, Package
} from 'lucide-react'

const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`
const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-EC', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
}) : '—'

export default function Dashboard() {
    const { usuario } = useAuth()
    const esAdmin = usuario?.rol === 'administrador'

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardService.obtener().then(r => r.data),
        refetchInterval: 60000 // refresca cada 60 segundos
    })

    if (isLoading) return <Spinner />

    const hora = new Date().getHours()
    const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

    return (
        <div className="space-y-4">

            {/* Bienvenida — ancho completo */}
            <div className="bg-[#1C3F6E] rounded-xl p-5 flex items-center justify-between">
                <div>
                    <div className="text-white/60 text-xs mb-1">{saludo},</div>
                    <div className="text-white text-lg font-bold">{usuario?.nombre} {usuario?.apellido || ''}</div>
                    <div className="text-[#F5C400] text-xs mt-1 capitalize flex items-center gap-1">
                        {esAdmin
                            ? <><CheckCircle size={11} /> <span>Administrador — acceso completo</span></>
                            : <><UserCog size={11} /> <span>Técnico</span></>
                        }
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-white/40 text-xs">
                        {new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div className="text-white text-2xl font-bold mt-1">
                        {new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {data?.pendientes?.total > 0 && (
                        <div className="mt-2 bg-[#F5C400] text-[#1A2332] text-[10px] font-bold px-3 py-1 rounded-full inline-block">
                            {data.pendientes.total} servicios pendientes
                        </div>
                    )}
                </div>
            </div>

            {/* Métricas 2x2 + Gráfica lado a lado */}
            <div className="flex gap-4">

                {/* Métricas en grid 2x2 — ancho fijo */}
                <div className="grid grid-cols-2 gap-3 flex-shrink-0 w-72">
                    {[
                        { label: 'Servicios', valor: data?.hoy?.servicios, icon: Activity, color: 'text-[#1C3F6E]', bg: 'bg-blue-50', sub: 'hoy' },
                        { label: 'Vulcanizados', valor: data?.hoy?.vulcanizados, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', sub: 'hoy' },
                        { label: 'Reencauches', valor: data?.hoy?.reencauches, icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50', sub: 'hoy' },
                        { label: 'Reparaciones', valor: data?.hoy?.reparaciones, icon: Wrench, color: 'text-green-500', bg: 'bg-green-50', sub: 'hoy' },
                    ].map(({ label, valor, icon: Icon, color, bg, sub }) => (
                        <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">{label}</span>
                                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                                    <Icon size={13} className={color} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A2332]">{valor ?? 0}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
                        </div>
                    ))}
                </div>

                {/* Gráfica compacta — 3 columnas */}
                <div className="flex-1 min-w-0" style={{ height: '200px' }}>
                    <GraficaTendencias compact />
                </div>
            </div>

            {/* Ingreso del día + Pendientes + Alertas */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-[#1C3F6E] to-[#2563A8] rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-[#F5C400]" />
                        <span className="text-xs text-white/60">Ingreso del día</span>
                    </div>
                    <div className="text-2xl font-bold text-[#F5C400]">{fmt(data?.hoy?.ingreso)}</div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>Mes actual</span>
                            <span className="text-white font-semibold">{fmt(data?.mes?.ingreso)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-white/60">
                            <span>Servicios del mes</span>
                            <span className="text-white font-semibold">{data?.mes?.servicios ?? 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={14} className="text-orange-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pendientes</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <Flame size={13} className="text-orange-500" />
                                </div>
                                <span className="text-xs text-gray-600">Vulcanizados</span>
                            </div>
                            <span className="text-lg font-bold text-[#1A2332]">{data?.pendientes?.vulcanizados ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <RefreshCw size={13} className="text-blue-500" />
                                </div>
                                <span className="text-xs text-gray-600">Reencauches</span>
                            </div>
                            <span className="text-lg font-bold text-[#1A2332]">{data?.pendientes?.reencauches ?? 0}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex justify-between">
                            <span className="text-xs text-gray-500">Total</span>
                            <span className="text-sm font-bold text-orange-500">{data?.pendientes?.total ?? 0} órdenes</span>
                        </div>
                    </div>
                </div>

                <div className={`rounded-xl p-4 border ${data?.generales?.alertasStock > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={14} className={data?.generales?.alertasStock > 0 ? 'text-red-500' : 'text-gray-400'} />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alertas stock</span>
                    </div>
                    {data?.generales?.alertasStock === 0 ? (
                        <div className="text-center py-3">
                            <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Stock suficiente en todos los insumos</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {data?.alertasStock?.slice(0, 3).map(p => (
                                <div key={p.id_producto} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                                    <span className="text-xs text-gray-700 truncate flex-1">{p.nombre}</span>
                                    <span className="text-xs font-bold text-red-500 ml-2">{p.stock}/{p.stock_minimo}</span>
                                </div>
                            ))}
                            {data?.generales?.alertasStock > 3 && (
                                <p className="text-[10px] text-red-400 text-center">+{data.generales.alertasStock - 3} más en alerta</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Actividad reciente */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <Wrench size={13} className="text-green-500" />
                        <span className="text-xs font-semibold text-[#1A2332] uppercase tracking-wide">Últimas reparaciones</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {data?.ultimasReparaciones?.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-400">Sin reparaciones recientes</div>
                        ) : data?.ultimasReparaciones?.map(r => (
                            <div key={r.id_reparacion} className="flex items-center gap-3 px-4 py-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${r.tipo_reparacion === 'arreglo' ? 'bg-green-50' : 'bg-purple-50'}`}>
                                    <Wrench size={12} className={r.tipo_reparacion === 'arreglo' ? 'text-green-500' : 'text-purple-500'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-[#1A2332] truncate">
                                        {r.cliente?.nombre} {r.cliente?.apellido || ''}
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                                        <span className="capitalize">{r.tipo_reparacion}</span>
                                        <span>·</span>
                                        <span>{fmtFecha(r.fecha)}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#1C3F6E]">{fmt(r.costo)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <Flame size={13} className="text-orange-500" />
                        <span className="text-xs font-semibold text-[#1A2332] uppercase tracking-wide">Últimos vulcanizados</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {data?.ultimosVulcanizados?.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-400">Sin vulcanizados recientes</div>
                        ) : data?.ultimosVulcanizados?.map(v => (
                            <div key={v.id_vulcanizado} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                    <Flame size={12} className="text-orange-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-[#1A2332] truncate">
                                        {v.cliente?.nombre} {v.cliente?.apellido || ''}
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                                        <span className={`capitalize px-1.5 py-0.5 rounded-full text-[9px] font-medium ${v.estado === 'entregado' ? 'bg-green-100 text-green-600'
                                            : v.estado === 'listo' ? 'bg-blue-100 text-blue-600'
                                                : 'bg-orange-100 text-orange-600'
                                            }`}>{v.estado}</span>
                                        <span>{fmtFecha(v.fecha_ingreso)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-semibold text-[#1C3F6E]">
                                        {fmt(parseFloat(v.abono || 0) + parseFloat(v.saldo || 0))}
                                    </div>
                                    {parseFloat(v.saldo) > 0 && (
                                        <div className="text-[10px] text-red-400">-{fmt(v.saldo)} saldo</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}