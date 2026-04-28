import Badge from '../ui/Badge'
import { Phone, Wrench, ArrowLeftRight, FileText, Truck } from 'lucide-react'

export default function DetalleReparacion({ reparacion: r }) {
    if (!r) return null

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1C3F6E] rounded-xl p-3 text-white">
                    <div className="text-xs text-white/50 mb-1">Cliente</div>
                    <div className="text-sm font-semibold">{r.cliente?.nombre} {r.cliente?.apellido || ''}</div>
                    {r.cliente?.telefono && (
                        <div className="text-xs text-white/60 mt-0.5 flex items-center gap-1">
                            <Phone size={12} />
                            <span>{r.cliente.telefono}</span>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Información</div>
                    <div className="text-xs text-[#1A2332]">
                        <div>Fecha: <span className="font-medium">{new Date(r.fecha).toLocaleDateString('es-EC')}</span></div>
                        <div className="mt-0.5 flex items-center gap-1">
                            Tipo:
                            <Badge variante={r.tipo_reparacion === 'arreglo' ? 'info' : 'warning'}>
                                <span className="flex items-center gap-1">
                                    {r.tipo_reparacion === 'arreglo'
                                        ? <Wrench size={10} />
                                        : <ArrowLeftRight size={10} />
                                    }
                                    <span>{r.tipo_reparacion === 'arreglo' ? 'Arreglo' : 'Cambio'}</span>
                                </span>
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehículo y chofer — usar r en vez de v */}
            {(r.placa_vehiculo || r.chofer_servicio) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <div className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Truck size={11} />
                        <span>Vehículo del servicio</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {r.placa_vehiculo && (
                            <div>
                                <div className="text-[10px] text-gray-500">Placa</div>
                                <div className="text-xs font-mono font-bold text-[#1A2332]">{r.placa_vehiculo}</div>
                            </div>
                        )}
                        {r.chofer_servicio && (
                            <div>
                                <div className="text-[10px] text-gray-500">Chofer responsable</div>
                                <div className="text-xs font-semibold text-[#1A2332]">{r.chofer_servicio}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Neumático */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Neumático</div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-[#1A2332]">{r.marca_neumatico} · {r.medida_neumatico}</span>
                    {r.dot_neumatico && <span className="text-xs text-gray-500">DOT: {r.dot_neumatico}</span>}
                </div>
                {r.descripcion && (
                    <div className="text-xs text-gray-500 mt-2 bg-white rounded px-2 py-1.5 border border-gray-200 flex items-start gap-1">
                        <FileText size={12} className="flex-shrink-0 mt-0.5" />
                        <span>{r.descripcion}</span>
                    </div>
                )}
            </div>

            {/* Insumos usados (arreglo) */}
            {r.uso_productos?.length > 0 && (
                <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Insumos utilizados</div>
                    <div className="space-y-1">
                        {r.uso_productos.map((u, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs">
                                <span className="text-[#1A2332] font-medium">{u.producto?.nombre}</span>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <span>x{u.cantidad}</span>
                                    <span className="font-semibold text-[#1C3F6E]">
                                        ${(parseFloat(u.producto?.precio_venta || 0) * u.cantidad).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detalle cambio */}
            {r.tipo_reparacion === 'cambio' && r.detalles_cambio?.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <div className="text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <ArrowLeftRight size={13} />
                        <span>Detalle del cambio</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="text-[#1A2332]">
                            <span className="font-medium">{r.detalles_cambio[0].cantidad_cambios || 1}</span>
                            <span className="text-gray-500"> cambio{(r.detalles_cambio[0].cantidad_cambios || 1) > 1 ? 's' : ''} realizados</span>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500">Precio por cambio</div>
                            <div className="font-semibold text-[#1C3F6E]">
                                ${parseFloat(r.detalles_cambio[0].precio_mano_obra || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Costo total */}
            <div className="flex justify-between items-center bg-[#1C3F6E] rounded-xl px-4 py-3 text-white">
                <span className="text-sm font-medium">Costo total</span>
                <span className="text-lg font-bold text-[#F5C400]">${parseFloat(r.costo || 0).toFixed(2)}</span>
            </div>

            {r.observaciones && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 flex items-start gap-1">
                    <FileText size={12} className="flex-shrink-0 mt-0.5" />
                    <span>{r.observaciones}</span>
                </div>
            )}
        </div>
    )
}