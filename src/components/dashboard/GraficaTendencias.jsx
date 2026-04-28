import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../../services/dashboard'
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, BarChart2 } from 'lucide-react'

const FILTROS = [
    { label: '7 días', valor: 7 },
    { label: '15 días', valor: 15 },
    { label: '30 días', valor: 30 },
]

const TOOLTIP_STYLE = {
    contentStyle: {
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    }
}

const formatFecha = (fecha) => {
    const d = new Date(fecha + 'T12:00:00')
    return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

export default function GraficaTendencias() {
    const [dias, setDias] = useState(30)
    const [tipoGrafica, setTipoGrafica] = useState('lineas') // 'lineas' | 'barras'
    const [vista, setVista] = useState('servicios') // 'servicios' | 'ingreso'

    const { data: tendencias = [], isLoading } = useQuery({
        queryKey: ['tendencias', dias],
        queryFn: () => dashboardService.tendencias(dias).then(r => r.data),
        refetchInterval: 120000
    })

    const datosFormateados = tendencias.map(d => ({
        ...d,
        fechaLabel: formatFecha(d.fecha),
        total: d.vulcanizados + d.reencauches + d.reparaciones + d.ventas,
        ingreso: parseFloat(d.ingreso.toFixed(2))
    }))

    const ChartComponent = tipoGrafica === 'lineas' ? LineChart : BarChart

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp size={15} className="text-[#1C3F6E]" />
                    <span className="text-xs font-semibold text-[#1A2332] uppercase tracking-wide">
                        Tendencias
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Vista servicios/ingreso */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => setVista('servicios')}
                            className={`px-3 h-7 text-[10px] font-medium transition-colors ${vista === 'servicios' ? 'bg-[#1C3F6E] text-white' : 'text-gray-500 hover:bg-gray-50'
                                }`}>
                            Servicios
                        </button>
                        <button onClick={() => setVista('ingreso')}
                            className={`px-3 h-7 text-[10px] font-medium transition-colors ${vista === 'ingreso' ? 'bg-[#1C3F6E] text-white' : 'text-gray-500 hover:bg-gray-50'
                                }`}>
                            Ingresos $
                        </button>
                    </div>

                    {/* Tipo gráfica */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => setTipoGrafica('lineas')}
                            className={`px-2 h-7 transition-colors ${tipoGrafica === 'lineas' ? 'bg-[#1C3F6E] text-white' : 'text-gray-400 hover:bg-gray-50'
                                }`}>
                            <TrendingUp size={12} />
                        </button>
                        <button onClick={() => setTipoGrafica('barras')}
                            className={`px-2 h-7 transition-colors ${tipoGrafica === 'barras' ? 'bg-[#1C3F6E] text-white' : 'text-gray-400 hover:bg-gray-50'
                                }`}>
                            <BarChart2 size={12} />
                        </button>
                    </div>

                    {/* Período */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                        {FILTROS.map(f => (
                            <button key={f.valor} onClick={() => setDias(f.valor)}
                                className={`px-3 h-7 text-[10px] font-medium transition-colors ${dias === f.valor ? 'bg-[#1C3F6E] text-white' : 'text-gray-500 hover:bg-gray-50'
                                    }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gráfica */}
            {isLoading ? (
                <div className="h-48 flex items-center justify-center text-xs text-gray-400">
                    Cargando datos...
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    {vista === 'servicios' ? (
                        <ChartComponent data={datosFormateados} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="fechaLabel" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={dias === 7 ? 0 : dias === 15 ? 1 : 4} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip {...TOOLTIP_STYLE} labelStyle={{ fontWeight: 600, color: '#1A2332' }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                            {tipoGrafica === 'lineas' ? (
                                <>
                                    <Line type="monotone" dataKey="vulcanizados" name="Vulcanizados" stroke="#F97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="reencauches" name="Reencauches" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="reparaciones" name="Reparaciones" stroke="#22C55E" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="ventas" name="Ventas" stroke="#A855F7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                </>
                            ) : (
                                <>
                                    <Bar dataKey="vulcanizados" name="Vulcanizados" fill="#F97316" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="reencauches" name="Reencauches" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="reparaciones" name="Reparaciones" fill="#22C55E" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="ventas" name="Ventas" fill="#A855F7" radius={[3, 3, 0, 0]} />
                                </>
                            )}
                        </ChartComponent>
                    ) : (
                        <ChartComponent data={datosFormateados} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="fechaLabel" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={dias === 7 ? 0 : dias === 15 ? 1 : 4} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                            <Tooltip {...TOOLTIP_STYLE} labelStyle={{ fontWeight: 600, color: '#1A2332' }} formatter={(v) => [`$${v.toFixed(2)}`, 'Ingreso']} />
                            {tipoGrafica === 'lineas' ? (
                                <Line type="monotone" dataKey="ingreso" name="Ingreso $" stroke="#F5C400" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                            ) : (
                                <Bar dataKey="ingreso" name="Ingreso $" fill="#F5C400" radius={[3, 3, 0, 0]} />
                            )}
                        </ChartComponent>
                    )}
                </ResponsiveContainer>
            )}
        </div>
    )
}