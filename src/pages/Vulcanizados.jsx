import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vulcanizadosService } from '../services/vulcanizados'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import FormVulcanizado from '../components/vulcanizados/FormVulcanizado'
import DetalleVulcanizado from '../components/vulcanizados/DetalleVulcanizado'
import { Flame, FileText } from 'lucide-react'

const ESTADOS = {
    pendiente: { label: 'Pendiente', variante: 'warning' },
    listo: { label: 'Listo', variante: 'yellow' },
    entregado: { label: 'Entregado', variante: 'success' },
}

const formatFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleDateString('es-EC')
}

export default function Vulcanizados() {
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [filtroEstado, setFiltroEstado] = useState('')
    const [modalForm, setModalForm] = useState(false)
    const [modalDetalle, setModalDetalle] = useState(false)
    const [vulcanizadoSeleccionado, setVulcanizadoSeleccionado] = useState(null)
    const [qrsNuevos, setQrsNuevos] = useState([])
    const [modalQR, setModalQR] = useState(false)

    const { data: vulcanizados = [], isLoading } = useQuery({
        queryKey: ['vulcanizados', filtroEstado],
        queryFn: () => vulcanizadosService.listar(
            filtroEstado ? { estado: filtroEstado } : {}
        ).then(r => r.data)
    })

    const mutacionCrear = useMutation({
        mutationFn: (data) => vulcanizadosService.crear(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['vulcanizados'])
            queryClient.invalidateQueries(['neumaticos-taller'])
            setModalForm(false)

            const qrs = res.data.qrs_generados
            if (qrs && qrs.length > 0) {
                setQrsNuevos(qrs)
                setModalQR(true)
            } else {
                mostrar('Orden de vulcanizado registrada correctamente')
            }
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al guardar', 'error')
    })

    const mutacionEstado = useMutation({
        mutationFn: ({ id, estado }) => vulcanizadosService.cambiarEstado(id, estado),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries(['vulcanizados'])
            setModalDetalle(false)
            mostrar('Estado actualizado correctamente')
        },
        onError: () => mostrar('Error al cambiar estado', 'error')
    })

    const mutacionAbono = useMutation({
        mutationFn: ({ id, monto }) => vulcanizadosService.registrarAbono(id, monto),
        onSuccess: () => {
            queryClient.invalidateQueries(['vulcanizados'])
            mostrar('Abono registrado correctamente')
        },
        onError: () => mostrar('Error al registrar abono', 'error')
    })

    const abrirDetalle = (v) => {
        setVulcanizadoSeleccionado(v)
        setModalDetalle(true)
    }

    const conteo = (estado) => vulcanizados.filter(v => v.estado === estado).length

    const esHoy = (fecha) => {
        if (!fecha) return false
        return new Date(fecha).toDateString() === new Date().toDateString()
    }

    const esPasada = (fecha, estado) => {
        if (!fecha || estado === 'entregado') return false
        const f = new Date(fecha)
        f.setHours(0, 0, 0, 0)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        return f < hoy
    }

    const tabClase = (val) => {
        const activo = filtroEstado === val
        if (!activo) return 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
        if (val === '') return 'bg-[#1C3F6E] text-white border-[#1C3F6E]'
        if (val === 'pendiente') return 'bg-orange-50 text-orange-700 border-orange-400'
        if (val === 'listo') return 'bg-yellow-50 text-yellow-700 border-yellow-400'
        return 'bg-green-50 text-green-700 border-green-400'
    }

    const tabs = [
        { val: '', label: 'Todos', count: vulcanizados.length },
        { val: 'pendiente', label: 'Pendientes', count: conteo('pendiente') },
        { val: 'listo', label: 'Listos', count: conteo('listo') },
        { val: 'entregado', label: 'Entregados', count: conteo('entregado') },
    ]

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-5">
                {tabs.map(({ val, label, count }) => (
                    <button
                        key={val}
                        onClick={() => setFiltroEstado(val)}
                        className={`flex items-center gap-2 h-8 px-4 rounded-full text-xs font-medium transition-colors border ${tabClase(val)}`}
                    >
                        <span>{label}</span>
                        <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">
                            {count}
                        </span>
                    </button>
                ))}
                <button
                    onClick={() => setModalForm(true)}
                    className="ml-auto h-9 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold px-4 rounded-lg transition-colors"
                >
                    + Nueva orden
                </button>
            </div>

            {/* Contenido */}
            {isLoading ? (
                <Spinner />
            ) : vulcanizados.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                    {filtroEstado
                        ? <span>No hay vulcanizados con estado {filtroEstado}</span>
                        : <span>No hay vulcanizados registrados</span>
                    }
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {vulcanizados.map(v => {
                        const entregaHoy = esHoy(v.fecha_entrega_estimada)
                        const entregaPasada = esPasada(v.fecha_entrega_estimada, v.estado)
                        const saldo = parseFloat(v.saldo || 0)
                        const abono = parseFloat(v.abono || 0)

                        return (
                            <div
                                key={v.id_vulcanizado}
                                onClick={() => abrirDetalle(v)}
                                className={`bg-white rounded-xl p-4 cursor-pointer hover:border-[#1C3F6E] transition-colors border ${entregaPasada
                                    ? 'border-l-4 border-l-red-400 border-gray-200'
                                    : entregaHoy
                                        ? 'border-l-4 border-l-orange-400 border-gray-200'
                                        : 'border-gray-200'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-[#1A2332]">
                                        {v.cliente?.nombre}{v.cliente?.apellido ? ' ' + v.cliente.apellido : ''}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {entregaHoy && (
                                            <span className="text-[9px] bg-red-50 text-red-600 border border-red-300 px-2 py-0.5 rounded-full font-semibold">
                                                HOY
                                            </span>
                                        )}
                                        {entregaPasada && (
                                            <span className="text-[9px] bg-red-50 text-red-600 border border-red-300 px-2 py-0.5 rounded-full font-semibold">
                                                VENCIDO
                                            </span>
                                        )}
                                        <Badge variante={ESTADOS[v.estado]?.variante}>
                                            {ESTADOS[v.estado]?.label}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Detalles neumáticos */}
                                {v.detalles?.map((d, i) => (
                                    <div key={i} className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        <Flame size={12} className="text-orange-500 flex-shrink-0" />
                                        <span>{d.marca} {d.medida}</span>
                                        {d.dot ? <span> · DOT: {d.dot}</span> : null}
                                        {d.deja_rin ? <span> · Deja rin</span> : null}
                                    </div>
                                ))}

                                {/* Fechas y cobro */}
                                <div className="grid grid-cols-2 gap-x-4 mt-3 text-xs">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Entrega estimada</span>
                                        <span className={`font-medium ${entregaPasada ? 'text-red-500'
                                            : entregaHoy ? 'text-orange-500'
                                                : 'text-[#1A2332]'
                                            }`}>
                                            {formatFecha(v.fecha_entrega_estimada)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Abono</span>
                                        <span className="font-medium text-[#1A2332]">
                                            ${abono.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 mt-1">
                                        <span>Saldo pendiente</span>
                                        <span className={`font-semibold ${saldo > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            ${saldo.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Observaciones */}
                                {v.observaciones ? (
                                    <div className="mt-2 text-[10px] text-gray-400 bg-gray-50 rounded-lg px-2 py-1 truncate flex items-center gap-1">
                                        <FileText size={11} className="flex-shrink-0" /> {v.observaciones}
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal nueva orden */}
            <Modal
                abierto={modalForm}
                onCerrar={() => setModalForm(false)}
                titulo="Nueva orden de vulcanizado"
                ancho="max-w-2xl"
            >
                <FormVulcanizado
                    onGuardar={(data) => mutacionCrear.mutate(data)}
                    cargando={mutacionCrear.isPending}
                    onCancelar={() => setModalForm(false)}
                />
            </Modal>

            {/* Modal detalle */}
            <Modal
                abierto={modalDetalle}
                onCerrar={() => { setModalDetalle(false); setVulcanizadoSeleccionado(null) }}
                titulo="Detalle de orden"
                ancho="max-w-2xl"
            >
                <DetalleVulcanizado
                    vulcanizado={vulcanizadoSeleccionado}
                    onCambiarEstado={(estado) => mutacionEstado.mutate({
                        id: vulcanizadoSeleccionado.id_vulcanizado, estado
                    })}
                    onRegistrarAbono={(monto) => mutacionAbono.mutate({
                        id: vulcanizadoSeleccionado.id_vulcanizado, monto
                    })}
                    cargando={mutacionEstado.isPending || mutacionAbono.isPending}
                />
            </Modal>
            import VistaQR from '../components/trazabilidad/VistaQR'

            {/* Modal QRs generados automáticamente */}
            <Modal
                abierto={modalQR}
                onCerrar={() => { setModalQR(false); setQrsNuevos([]); mostrar('Orden de vulcanizado registrada correctamente') }}
                titulo={`${qrsNuevos.length} QR${qrsNuevos.length > 1 ? 's' : ''} generado${qrsNuevos.length > 1 ? 's' : ''} para las llantas`}
                ancho="max-w-md"
            >
                <div className="space-y-4">
                    {qrsNuevos.map((qr, i) => (
                        <div key={i}>
                            {qrsNuevos.length > 1 && (
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Llanta {i + 1} — {qr.marca} · {qr.medida}
                                </div>
                            )}
                            <VistaQR data={{ neumatico: qr, qr_imagen: qr.qr_imagen, codigo_qr: qr.codigo_qr }} />
                            {i < qrsNuevos.length - 1 && <div className="border-t border-gray-200 mt-4" />}
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    )
}