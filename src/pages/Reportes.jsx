import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportesService } from '../services/reportes'
import Spinner from '../components/ui/Spinner'
import { BarChart2, Package, Wrench, Flame, RefreshCw, FileText, Download } from 'lucide-react'

const hoy = new Date().toISOString().split('T')[0]
const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

export default function Reportes() {
    const [tab, setTab] = useState('servicios')
    const [desde, setDesde] = useState(primerDiaMes)
    const [hasta, setHasta] = useState(hoy)
    const [tipoServicio, setTipoServicio] = useState('')

    const { data: dataServicios, isLoading: cargandoServicios, refetch: refetchServicios } = useQuery({
        queryKey: ['reporte-servicios', desde, hasta, tipoServicio],
        queryFn: () => reportesService.servicios({ desde, hasta, tipo: tipoServicio || undefined }).then(r => r.data),
        enabled: tab === 'servicios'
    })

    const { data: dataInsumos, isLoading: cargandoInsumos, refetch: refetchInsumos } = useQuery({
        queryKey: ['reporte-insumos', desde, hasta],
        queryFn: () => reportesService.insumos({ desde, hasta }).then(r => r.data),
        enabled: tab === 'insumos'
    })

    const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-EC') : '—'
    const formatMoney = (n) => `$${parseFloat(n || 0).toFixed(2)}`

    const tarjetasResumen = dataServicios ? [
        { label: 'Vulcanizados', cantidad: dataServicios.resumen.vulcanizados.cantidad, total: dataServicios.resumen.vulcanizados.total, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Reencauches', cantidad: dataServicios.resumen.reencauches.cantidad, total: dataServicios.resumen.reencauches.total, icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Arreglos', cantidad: dataServicios.resumen.arreglos.cantidad, total: dataServicios.resumen.arreglos.total, icon: Wrench, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Cambios', cantidad: dataServicios.resumen.cambios.cantidad, total: dataServicios.resumen.cambios.total, icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-50' },
    ] : []

    return (
        <div>
            {/* Filtros */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Desde</label>
                        <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                            max={hasta}
                            className="h-8 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hasta</label>
                        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                            min={desde} max={hoy}
                            className="h-8 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
                    </div>
                    {tab === 'servicios' && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
                            <select value={tipoServicio} onChange={e => setTipoServicio(e.target.value)}
                                className="h-8 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]">
                                <option value="">Todos</option>
                                <option value="vulcanizado">Vulcanizados</option>
                                <option value="reencauche">Reencauches</option>
                                <option value="arreglo">Arreglos</option>
                                <option value="cambio">Cambios de neumático</option>
                            </select>
                        </div>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-gray-400">
                            {desde === primerDiaMes && hasta === hoy ? 'Mes actual' : `${formatFecha(desde)} — ${formatFecha(hasta)}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
                {[
                    { id: 'servicios', label: 'Servicios por período', icon: BarChart2 },
                    { id: 'insumos', label: 'Insumos consumidos', icon: Package },
                ].map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${tab === id
                                ? 'bg-[#1C3F6E] text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}>
                        <Icon size={14} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {/* Tab: Servicios */}
            {tab === 'servicios' && (
                <div className="space-y-5">
                    {cargandoServicios ? <Spinner /> : dataServicios ? (
                        <>
                            {/* Tarjetas resumen */}
                            <div className="grid grid-cols-4 gap-3">
                                {tarjetasResumen.map(({ label, cantidad, total, icon: Icon, color, bg }) => (
                                    <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500">{label}</span>
                                            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                                                <Icon size={13} className={color} />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-[#1A2332]">{cantidad}</div>
                                        <div className="text-xs text-gray-500 mt-1">{formatMoney(total)} facturado</div>
                                    </div>
                                ))}
                            </div>

                            {/* Total general */}
                            <div className="bg-[#1C3F6E] rounded-xl p-4 flex items-center justify-between">
                                <div className="text-white">
                                    <div className="text-xs text-white/60 mb-1">Total facturado en el período</div>
                                    <div className="text-2xl font-bold text-[#F5C400]">
                                        {formatMoney(dataServicios.resumen.total_general)}
                                    </div>
                                </div>
                                <div className="text-white/40 text-right text-xs">
                                    <div>{dataServicios.resumen.vulcanizados.cantidad + dataServicios.resumen.reencauches.cantidad + dataServicios.resumen.arreglos.cantidad + dataServicios.resumen.cambios.cantidad} servicios totales</div>
                                    <div className="mt-1">{formatFecha(desde)} — {formatFecha(hasta)}</div>
                                </div>
                            </div>

                            {/* Detalle vulcanizados */}
                            {dataServicios.detalle.vulcanizados.length > 0 && (!tipoServicio || tipoServicio === 'vulcanizado') && (
                                <TablaDetalle
                                    titulo="Vulcanizados"
                                    icon={Flame}
                                    iconColor="text-orange-500"
                                    datos={dataServicios.detalle.vulcanizados}
                                    columnas={[
                                        { label: 'Cliente', render: r => `${r.cliente?.nombre} ${r.cliente?.apellido || ''}` },
                                        { label: 'Técnico', render: r => r.usuario?.nombre || '—' },
                                        { label: 'Fecha', render: r => formatFecha(r.fecha_ingreso) },
                                        { label: 'Estado', render: r => <span className="capitalize">{r.estado}</span> },
                                        { label: 'Abono', render: r => formatMoney(r.abono) },
                                        { label: 'Saldo', render: r => <span className={parseFloat(r.saldo) > 0 ? 'text-red-500' : 'text-green-600'}>{formatMoney(r.saldo)}</span> },
                                        { label: 'Total', render: r => formatMoney(parseFloat(r.abono || 0) + parseFloat(r.saldo || 0)) },
                                    ]}
                                />
                            )}

                            {/* Detalle reencauches */}
                            {dataServicios.detalle.reencauches.length > 0 && (!tipoServicio || tipoServicio === 'reencauche') && (
                                <TablaDetalle
                                    titulo="Reencauches"
                                    icon={RefreshCw}
                                    iconColor="text-blue-500"
                                    datos={dataServicios.detalle.reencauches}
                                    columnas={[
                                        { label: 'Cliente', render: r => `${r.cliente?.nombre} ${r.cliente?.apellido || ''}` },
                                        { label: 'Fecha', render: r => formatFecha(r.fecha_ingreso) },
                                        { label: 'Estado', render: r => <span className="capitalize">{r.estado?.replace('_', ' ')}</span> },
                                        { label: 'Neumáticos', render: r => <span>{r.detalles?.length || 0}</span> },
                                        { label: 'Abono', render: r => formatMoney(r.abono) },
                                        { label: 'Saldo', render: r => <span className={parseFloat(r.saldo) > 0 ? 'text-red-500' : 'text-green-600'}>{formatMoney(r.saldo)}</span> },
                                        { label: 'Total', render: r => formatMoney(parseFloat(r.abono || 0) + parseFloat(r.saldo || 0)) },
                                    ]}
                                />
                            )}

                            {/* Detalle reparaciones */}
                            {dataServicios.detalle.reparaciones.length > 0 && (!tipoServicio || tipoServicio === 'arreglo' || tipoServicio === 'cambio' || tipoServicio === 'reparacion') && (
                                <TablaDetalle
                                    titulo="Reparaciones y cambios"
                                    icon={Wrench}
                                    iconColor="text-green-500"
                                    datos={dataServicios.detalle.reparaciones}
                                    columnas={[
                                        { label: 'Cliente', render: r => `${r.cliente?.nombre} ${r.cliente?.apellido || ''}` },
                                        { label: 'Técnico', render: r => r.usuario?.nombre || '—' },
                                        { label: 'Tipo', render: r => <span className="capitalize">{r.tipo_reparacion}</span> },
                                        { label: 'Fecha', render: r => formatFecha(r.fecha) },
                                        { label: 'Descripción', render: r => <span className="text-gray-500 truncate max-w-[120px] block">{r.descripcion || '—'}</span> },
                                        { label: 'Costo', render: r => formatMoney(r.costo) },
                                    ]}
                                />
                            )}

                            {/* Sin datos */}
                            {dataServicios.detalle.vulcanizados.length === 0 &&
                                dataServicios.detalle.reencauches.length === 0 &&
                                dataServicios.detalle.reparaciones.length === 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-sm text-gray-400">
                                        No hay servicios registrados en el período seleccionado
                                    </div>
                                )}
                        </>
                    ) : null}
                </div>
            )}

            {/* Tab: Insumos */}
            {tab === 'insumos' && (
                <div>
                    {cargandoInsumos ? <Spinner /> : dataInsumos ? (
                        <div className="space-y-3">
                            {/* Resumen */}
                            <div className="bg-[#1C3F6E] rounded-xl p-4 flex items-center justify-between">
                                <div className="text-white">
                                    <div className="text-xs text-white/60 mb-1">Insumos consumidos en el período</div>
                                    <div className="text-2xl font-bold text-[#F5C400]">{dataInsumos.insumos.length}</div>
                                    <div className="text-xs text-white/50 mt-1">productos distintos</div>
                                </div>
                                <div className="text-white/40 text-right text-xs">
                                    <div>{dataInsumos.total_registros} usos registrados</div>
                                    <div className="mt-1">{formatFecha(desde)} — {formatFecha(hasta)}</div>
                                </div>
                            </div>

                            {dataInsumos.insumos.length === 0 ? (
                                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-sm text-gray-400">
                                    No hay consumo de insumos registrado en el período seleccionado
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                {['Insumo', 'Categoría', 'Unidad', 'Total consumido', 'Usos registrados'].map(h => (
                                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataInsumos.insumos.map((ins, i) => (
                                                <tr key={ins.id_producto} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                                    <td className="px-4 py-3 font-medium text-[#1A2332]">{ins.nombre}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">{ins.categoria || '—'}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs capitalize">{ins.unidad_medida}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-lg font-bold text-[#1C3F6E]">{ins.total_cantidad}</span>
                                                        <span className="text-xs text-gray-400 ml-1">{ins.unidad_medida}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">{ins.usos.length} servicios</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}

// Componente auxiliar para tablas de detalle
function TablaDetalle({ titulo, icon: Icon, iconColor, datos, columnas }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <Icon size={14} className={iconColor} />
                <span className="text-xs font-semibold text-[#1A2332] uppercase tracking-wide">{titulo}</span>
                <span className="ml-auto text-xs text-gray-400">{datos.length} registros</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {columnas.map(col => (
                                <th key={col.label} className="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((row, i) => (
                            <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                {columnas.map(col => (
                                    <td key={col.label} className="px-4 py-2 text-xs text-gray-700">
                                        {col.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}