import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { neumaticosService } from '../services/neumaticos'
import { Flame, RefreshCw, Wrench, ArrowLeftRight, Scissors, ClipboardList, Phone, XCircle } from 'lucide-react'

export default function HojaDeVidaQR() {
    const { codigo } = useParams()

    const { data: neumatico, isLoading, isError } = useQuery({
        queryKey: ['hoja-vida', codigo],
        queryFn: () => neumaticosService.hojaDeVida(codigo).then(r => r.data),
        retry: false
    })

    if (isLoading) return (
        <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-gray-200 border-t-[#1C3F6E] rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Cargando hoja de vida...</p>
            </div>
        </div>
    )

    if (isError || !neumatico) return (
        <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center px-4">
            <div className="text-center">
                <div className="flex justify-center mb-4"><XCircle size={48} className="text-red-400" /></div>
                <h2 className="text-lg font-bold text-[#1A2332] mb-2">QR no encontrado</h2>
                <p className="text-sm text-gray-500">El código escaneado no corresponde a ningún neumático registrado.</p>
            </div>
        </div>
    )

    const iconoServicio = (tipo) => {
        if (tipo === 'vulcanizado') return <Flame size={16} className="text-orange-500" />
        if (tipo === 'reencauche') return <RefreshCw size={16} className="text-green-600" />
        if (tipo === 'reparacion') return <Wrench size={16} className="text-blue-600" />
        if (tipo === 'cambio') return <ArrowLeftRight size={16} className="text-orange-600" />
        if (tipo === 'parchado') return <Scissors size={16} className="text-purple-600" />
        return <ClipboardList size={16} className="text-gray-500" />
    }

    const estadoColor = (estado) => {
        if (estado === 'activo') return 'bg-green-100 text-green-700 border-green-300'
        if (estado === 'en_servicio') return 'bg-orange-100 text-orange-700 border-orange-300'
        return 'bg-gray-100 text-gray-600 border-gray-300'
    }

    return (
        <div className="min-h-screen bg-[#F5F6FA]" style={{ maxWidth: '430px', margin: '0 auto' }}>
            {/* Header */}
            <div className="bg-[#1C3F6E] px-4 pt-6 pb-5">
                <div className="text-[#F5C400] font-bold text-base mb-4 flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#F5C400] rounded flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-[#1C3F6E] rounded-sm"></div>
                    </div>
                    Superllanta
                </div>
                <div className="text-[10px] text-white/40 font-mono mb-1">{neumatico.codigo_qr}</div>
                <div className="text-[#F5C400] text-lg font-bold">{neumatico.marca} · {neumatico.medida}</div>
                <div className="text-white/60 text-xs mt-1">
                    {neumatico.dot ? <span>DOT: {neumatico.dot} · </span> : null}
                    <span>Ingreso: {new Date(neumatico.fecha_registro).toLocaleDateString('es-EC')}</span>
                </div>
                <div className="flex gap-2 mt-3">
                    <span className={`text-[10px] font-medium px-3 py-1 rounded-full border ${estadoColor(neumatico.estado)}`}>
                        {neumatico.estado}
                    </span>
                    <span className="text-[10px] font-medium px-3 py-1 rounded-full border border-white/20 text-white/60">
                        {neumatico.historial?.length || 0} servicios
                    </span>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Datos del cliente */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Propietario</div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8F0FB] flex items-center justify-center text-sm font-bold text-[#1C3F6E] flex-shrink-0">
                            {neumatico.cliente?.nombre?.[0]}{neumatico.cliente?.apellido?.[0] || ''}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[#1A2332]">
                                {neumatico.cliente?.nombre} {neumatico.cliente?.apellido || ''}
                            </div>
                            {neumatico.cliente?.telefono && (
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                    <Phone size={12} />
                                    {neumatico.cliente.telefono}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Historial */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Historial de intervenciones
                    </div>
                    {!neumatico.historial || neumatico.historial.length === 0 ? (
                        <div className="text-center py-4 text-sm text-gray-400">
                            Sin intervenciones registradas
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {neumatico.historial.map((h, i) => (
                                <div key={h.id_historial} className="flex gap-3">
                                    {/* Timeline */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-[#E8F0FB] flex items-center justify-center text-sm flex-shrink-0">
                                            {iconoServicio(h.tipo_servicio)}
                                        </div>
                                        {i < neumatico.historial.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
                                        )}
                                    </div>
                                    {/* Contenido */}
                                    <div className="flex-1 pb-4">
                                        <div className="text-xs font-semibold text-[#1A2332] capitalize">
                                            {h.tipo_servicio?.replace('_', ' ')}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                            {new Date(h.fecha).toLocaleDateString('es-EC', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </div>
                                        {h.descripcion && (
                                            <div className="text-[10px] text-gray-600 mt-1 bg-gray-50 rounded px-2 py-1">
                                                {h.descripcion}
                                            </div>
                                        )}
                                        {h.usuario && (
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                Técnico: {h.usuario.nombre}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] text-gray-400 pb-4">
                    Sistema de trazabilidad · Superllanta<br />
                    Esta información es de solo lectura
                </div>
            </div>
        </div>
    )
}