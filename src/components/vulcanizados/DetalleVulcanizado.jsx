import { useState } from 'react'
import Badge from '../ui/Badge'
import { Phone, Flame, FileText, Clock } from 'lucide-react'

const ESTADOS = {
    pendiente: { label: 'Pendiente', variante: 'warning' },
    listo: { label: 'Listo', variante: 'yellow' },
    entregado: { label: 'Entregado', variante: 'success' },
}

const PASOS = ['pendiente', 'listo', 'entregado']

export default function DetalleVulcanizado({ vulcanizado: v, onCambiarEstado, onRegistrarAbono, cargando }) {
    const [nuevoAbono, setNuevoAbono] = useState('')
    const [errAbono, setErrAbono] = useState('')

    if (!v) return null

    const pasoActual = PASOS.indexOf(v.estado)

    const handleAbono = () => {
        const monto = parseFloat(nuevoAbono)
        if (!monto || monto <= 0) { setErrAbono('Ingresa un monto válido'); return }
        if (monto > parseFloat(v.saldo)) { setErrAbono('El abono no puede superar el saldo'); return }
        onRegistrarAbono(monto)
        setNuevoAbono('')
        setErrAbono('')
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const fechaEntrega = v.fecha_entrega_estimada
        ? new Date(v.fecha_entrega_estimada)
        : null
    if (fechaEntrega) fechaEntrega.setHours(0, 0, 0, 0)

    // Puede marcarse listo en cualquier momento
    // Solo puede marcarse entregado si la fecha estimada ya llegó o no tiene fecha
    const puedeEntregar = !fechaEntrega || fechaEntrega <= hoy

    const siguienteEstado = () => {
        if (v.estado === 'pendiente') return 'listo'
        if (v.estado === 'listo' && puedeEntregar) return 'entregado'
        return null
    }

    const mensajeBloqueo = v.estado === 'listo' && !puedeEntregar
        ? `Entrega estimada: ${fechaEntrega.toLocaleDateString('es-EC')}. Aún no ha llegado esa fecha.`
        : null

    return (
        <div className="space-y-4">
            {/* Stepper de estado */}
            <div className="flex items-center gap-0 mb-2">
                {PASOS.map((paso, i) => (
                    <div key={paso} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < pasoActual ? 'bg-green-500 border-green-500 text-white'
                                : i === pasoActual ? 'bg-orange-400 border-orange-400 text-white'
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {i < pasoActual ? '✓' : i + 1}
                            </div>
                            <div className={`text-[9px] mt-1 font-medium capitalize ${i === pasoActual ? 'text-orange-500' : i < pasoActual ? 'text-green-600' : 'text-gray-400'}`}>
                                {paso}
                            </div>
                        </div>
                        {i < PASOS.length - 1 && (
                            <div className={`h-0.5 flex-1 mb-4 ${i < pasoActual ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Info cliente y neumáticos */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1C3F6E] rounded-xl p-3 text-white">
                    <div className="text-xs text-white/50 mb-1">Cliente</div>
                    <div className="text-sm font-semibold">{v.cliente?.nombre} {v.cliente?.apellido || ''}</div>
                    {v.cliente?.telefono && <div className="text-xs text-white/60 mt-0.5 flex items-center gap-1"><Phone size={12} /> {v.cliente.telefono}</div>}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Fechas</div>
                    <div className="text-xs text-[#1A2332]">
                        <div>Ingreso: <span className="font-medium">{new Date(v.fecha_ingreso).toLocaleDateString('es-EC')}</span></div>
                        <div className="mt-0.5">Entrega est.: <span className="font-medium">
                            {v.fecha_entrega_estimada ? new Date(v.fecha_entrega_estimada).toLocaleDateString('es-EC') : '—'}
                        </span></div>
                        {v.fecha_entrega_real && (
                            <div className="mt-0.5 text-green-600">Entregado: <span className="font-medium">{new Date(v.fecha_entrega_real).toLocaleDateString('es-EC')}</span></div>
                        )}
                    </div>
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
                    {v.detalles?.map((d, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-[#1A2332] flex items-center gap-1">
                                    <Flame size={14} className="text-orange-500" /> {d.marca} · {d.medida} {d.dot ? `· DOT ${d.dot}` : ''}
                                </div>
                                <div className="text-sm font-semibold text-[#1C3F6E]">${parseFloat(d.precio || 0).toFixed(2)}</div>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                {d.deja_rin && <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">Deja rin</span>}
                                {d.descripcion && <span className="text-[10px] text-gray-500">{d.descripcion}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Observaciones */}
            {v.observaciones && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 flex items-start gap-1">
                    <FileText size={12} className="flex-shrink-0 mt-0.5" /> {v.observaciones}
                </div>
            )}

            {/* Cobro */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cobro</div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Abono recibido</span><span className="font-medium">${parseFloat(v.abono).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                    <span>Saldo pendiente</span>
                    <span className={parseFloat(v.saldo) > 0 ? 'text-red-500' : 'text-green-600'}>
                        ${parseFloat(v.saldo).toFixed(2)}
                    </span>
                </div>

                {/* Registrar abono */}
                {v.estado !== 'entregado' && parseFloat(v.saldo) > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-2">Registrar nuevo abono</div>
                        <div className="flex gap-2">
                            <input type="number" min="0.50" step="0.50"
                                value={nuevoAbono} onChange={e => { setNuevoAbono(e.target.value); setErrAbono('') }}
                                placeholder="Monto..."
                                className={`flex-1 h-8 border rounded-lg px-3 text-sm focus:outline-none ${errAbono ? 'border-red-400' : 'border-gray-300'}`} />
                            <button onClick={handleAbono} disabled={cargando}
                                className="h-8 px-4 bg-[#1C3F6E] text-white text-xs font-semibold rounded-lg disabled:opacity-60">
                                Registrar
                            </button>
                        </div>
                        {errAbono && <p className="text-[10px] text-red-500 mt-1">{errAbono}</p>}
                    </div>
                )}
            </div>

            {/* Acciones */}
            {v.estado !== 'entregado' && (
                <div>
                    {mensajeBloqueo ? (
                        <div className="w-full bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-xs text-orange-700 text-center flex items-center justify-center gap-2">
                            <Clock size={13} /> {mensajeBloqueo}
                        </div>
                    ) : siguienteEstado() ? (
                        <button
                            onClick={() => onCambiarEstado(siguienteEstado())}
                            disabled={cargando}
                            className="w-full h-10 bg-[#F5C400] hover:bg-yellow-400 text-[#1A2332] font-semibold text-sm rounded-lg transition-colors disabled:opacity-60"
                        >
                            {cargando
                                ? 'Actualizando...'
                                : siguienteEstado() === 'listo'
                                    ? '✓ Marcar como listo'
                                    : '✓ Marcar como entregado'
                            }
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    )
}