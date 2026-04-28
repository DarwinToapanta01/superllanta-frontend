import Badge from '../ui/Badge'
import { Phone, RefreshCw, FileText, Clock } from 'lucide-react'

const ESTADOS = {
    pendiente: { label: 'Pendiente', variante: 'gray' },
    en_proceso: { label: 'En proceso', variante: 'info' },
    listo: { label: 'Listo', variante: 'yellow' },
    entregado: { label: 'Entregado', variante: 'success' },
}

const PASOS = ['pendiente', 'en_proceso', 'listo', 'entregado']

export default function DetalleReencauche({ reencauche: r, onCambiarEstado, cargando }) {
    if (!r) return null

    const pasoActual = PASOS.indexOf(r.estado)

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
    const fechaEntrega = r.fecha_entrega_estimada ? new Date(r.fecha_entrega_estimada) : null
    if (fechaEntrega) fechaEntrega.setHours(0, 0, 0, 0)
    const puedeEntregar = !fechaEntrega || fechaEntrega <= hoy

    const siguienteEstado = () => {
        if (r.estado === 'pendiente') return 'en_proceso'
        if (r.estado === 'en_proceso') return 'listo'
        if (r.estado === 'listo' && puedeEntregar) return 'entregado'
        return null
    }

    const mensajeBloqueo = r.estado === 'listo' && !puedeEntregar
        ? `Entrega estimada: ${fechaEntrega.toLocaleDateString('es-EC')}. Aún no ha llegado esa fecha.`
        : null

    const labelSiguiente = () => {
        const sig = siguienteEstado()
        if (sig === 'en_proceso') return '▶ Iniciar proceso'
        if (sig === 'listo') return '✓ Marcar como listo'
        if (sig === 'entregado') return '✓ Marcar como entregado'
        return ''
    }

    return (
        <div className="space-y-4">
            {/* Stepper */}
            <div className="flex items-center gap-0">
                {PASOS.map((paso, i) => (
                    <div key={paso} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${i < pasoActual ? 'bg-green-500 border-green-500 text-white'
                                : i === pasoActual ? 'bg-[#F5C400] border-[#F5C400] text-[#1A2332]'
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {i < pasoActual ? '✓' : i + 1}
                            </div>
                            <div className={`text-[9px] mt-1 font-medium capitalize ${i === pasoActual ? 'text-[#E67E22]'
                                : i < pasoActual ? 'text-green-600'
                                    : 'text-gray-400'
                                }`}>
                                {paso.replace('_', ' ')}
                            </div>
                        </div>
                        {i < PASOS.length - 1 && (
                            <div className={`h-0.5 flex-1 mb-4 ${i < pasoActual ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1C3F6E] rounded-xl p-3 text-white">
                    <div className="text-xs text-white/50 mb-1">Cliente</div>
                    <div className="text-sm font-semibold">{r.cliente?.nombre} {r.cliente?.apellido || ''}</div>
                    {r.cliente?.telefono && <div className="text-xs text-white/60 mt-0.5 flex items-center gap-1"><Phone size={12} /> {r.cliente.telefono}</div>}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-[#1A2332]">
                    <div className="text-xs text-gray-500 mb-1">Fechas</div>
                    <div>Ingreso: <span className="font-medium">{new Date(r.fecha_ingreso).toLocaleDateString('es-EC')}</span></div>
                    <div className="mt-0.5">Entrega est.: <span className="font-medium">
                        {r.fecha_entrega_estimada ? new Date(r.fecha_entrega_estimada).toLocaleDateString('es-EC') : '—'}
                    </span></div>
                    {r.fecha_entrega_real && (
                        <div className="mt-0.5 text-green-600">Entregado: <span className="font-medium">
                            {new Date(r.fecha_entrega_real).toLocaleDateString('es-EC')}
                        </span></div>
                    )}
                </div>
            </div>

            {/* Vehículo y chofer */}
            {(v.placa_vehiculo || v.chofer_servicio) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3">
                    <div className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Truck size={11} />
                        Vehículo del servicio
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {v.placa_vehiculo && (
                            <div>
                                <div className="text-[10px] text-gray-500">Placa</div>
                                <div className="text-xs font-mono font-bold text-[#1A2332]">{v.placa_vehiculo}</div>
                            </div>
                        )}
                        {v.chofer_servicio && (
                            <div>
                                <div className="text-[10px] text-gray-500">Chofer responsable</div>
                                <div className="text-xs font-semibold text-[#1A2332]">{v.chofer_servicio}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Neumáticos */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Neumáticos</div>
                <div className="space-y-2">
                    {r.detalles?.map((d, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-[#1A2332] flex items-center gap-1">
                                    <RefreshCw size={13} className="text-green-600" /> <span>{d.marca} · {d.medida}</span>
                                    {d.dot ? <span className="text-xs text-gray-500"> · DOT {d.dot}</span> : null}
                                </div>
                                <span className="text-sm font-semibold text-[#1C3F6E]">${parseFloat(d.precio || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                                {d.tipo_reencauche && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">{d.tipo_reencauche}</span>}
                                {d.estado_neumatico && <span>{d.estado_neumatico}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {r.observaciones && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 flex items-start gap-1">
                    <FileText size={12} className="flex-shrink-0 mt-0.5" /> {r.observaciones}
                </div>
            )}

            {/* Cobro */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cobro</div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Abono recibido</span>
                    <span className="font-medium">${parseFloat(r.abono || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                    <span>Saldo pendiente</span>
                    <span className={parseFloat(r.saldo) > 0 ? 'text-red-500' : 'text-green-600'}>
                        ${parseFloat(r.saldo || 0).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Acción */}
            {r.estado !== 'entregado' && (
                <div>
                    {mensajeBloqueo ? (
                        <div className="w-full bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-xs text-orange-700 text-center flex items-center justify-center gap-2">
                            <Clock size={13} /> {mensajeBloqueo}
                        </div>
                    ) : siguienteEstado() ? (
                        <button onClick={() => onCambiarEstado(siguienteEstado())} disabled={cargando}
                            className="w-full h-10 bg-[#F5C400] hover:bg-yellow-400 text-[#1A2332] font-semibold text-sm rounded-lg transition-colors disabled:opacity-60">
                            {cargando ? 'Actualizando...' : labelSiguiente()}
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    )
}