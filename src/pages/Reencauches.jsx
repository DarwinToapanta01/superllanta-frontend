import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reencauchesService } from '../services/reencauches'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import FormReencauche from '../components/reencauches/FormReencauche'
import DetalleReencauche from '../components/reencauches/DetalleReencauche'

const ESTADOS = {
    pendiente: { label: 'Pendiente', variante: 'gray' },
    en_proceso: { label: 'En proceso', variante: 'info' },
    listo: { label: 'Listo', variante: 'yellow' },
    entregado: { label: 'Entregado', variante: 'success' },
}

const PASOS = ['pendiente', 'en_proceso', 'listo', 'entregado']

const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-EC') : '—'

export default function Reencauches() {
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [filtroEstado, setFiltroEstado] = useState('')
    const [modalForm, setModalForm] = useState(false)
    const [modalDetalle, setModalDetalle] = useState(false)
    const [seleccionado, setSeleccionado] = useState(null)

    const { data: reencauches = [], isLoading } = useQuery({
        queryKey: ['reencauches', filtroEstado],
        queryFn: () => reencauchesService.listar(
            filtroEstado ? { estado: filtroEstado } : {}
        ).then(r => r.data)
    })

    const mutacionCrear = useMutation({
        mutationFn: (data) => reencauchesService.crear(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['reencauches'])
            setModalForm(false)
            mostrar('Orden de reencauche registrada correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al guardar', 'error')
    })

    const mutacionEstado = useMutation({
        mutationFn: ({ id, estado }) => reencauchesService.cambiarEstado(id, estado),
        onSuccess: () => {
            queryClient.invalidateQueries(['reencauches'])
            setModalDetalle(false)
            mostrar('Estado actualizado correctamente')
        },
        onError: () => mostrar('Error al cambiar estado', 'error')
    })

    const conteo = (estado) => reencauches.filter(r => r.estado === estado).length

    const esPasada = (fecha, estado) => {
        if (!fecha || estado === 'entregado') return false
        const f = new Date(fecha); f.setHours(0, 0, 0, 0)
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
        return f < hoy
    }

    const esHoy = (fecha) => {
        if (!fecha) return false
        return new Date(fecha).toDateString() === new Date().toDateString()
    }

    const tabs = [
        { val: '', label: 'Todos', count: reencauches.length },
        { val: 'pendiente', label: 'Pendientes', count: conteo('pendiente') },
        { val: 'en_proceso', label: 'En proceso', count: conteo('en_proceso') },
        { val: 'listo', label: 'Listos', count: conteo('listo') },
        { val: 'entregado', label: 'Entregados', count: conteo('entregado') },
    ]

    const tabClase = (val) => {
        const activo = filtroEstado === val
        if (!activo) return 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
        if (val === '') return 'bg-[#1C3F6E] text-white border-[#1C3F6E]'
        if (val === 'pendiente') return 'bg-gray-100 text-gray-700 border-gray-400'
        if (val === 'en_proceso') return 'bg-blue-50 text-blue-700 border-blue-400'
        if (val === 'listo') return 'bg-yellow-50 text-yellow-700 border-yellow-400'
        return 'bg-green-50 text-green-700 border-green-400'
    }

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
                {tabs.map(({ val, label, count }) => (
                    <button key={val} onClick={() => setFiltroEstado(val)}
                        className={`flex items-center gap-2 h-8 px-4 rounded-full text-xs font-medium transition-colors border ${tabClase(val)}`}>
                        <span>{label}</span>
                        <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>
                    </button>
                ))}
                <button onClick={() => setModalForm(true)}
                    className="ml-auto h-9 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold px-4 rounded-lg transition-colors">
                    + Nueva orden
                </button>
            </div>

            {/* Grid de tarjetas */}
            {isLoading ? <Spinner /> : reencauches.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                    {filtroEstado
                        ? <span>No hay reencauches con estado {filtroEstado.replace('_', ' ')}</span>
                        : <span>No hay reencauches registrados</span>
                    }
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {reencauches.map(r => {
                        const pasada = esPasada(r.fecha_entrega_estimada, r.estado)
                        const hoy = esHoy(r.fecha_entrega_estimada)
                        const pasoActual = PASOS.indexOf(r.estado)
                        const saldo = parseFloat(r.saldo || 0)
                        const abono = parseFloat(r.abono || 0)

                        return (
                            <div key={r.id_reencauche}
                                onClick={() => { setSeleccionado(r); setModalDetalle(true) }}
                                className={`bg-white rounded-xl p-4 cursor-pointer hover:border-[#1C3F6E] transition-colors border ${pasada ? 'border-l-4 border-l-red-400 border-gray-200'
                                        : hoy ? 'border-l-4 border-l-orange-400 border-gray-200'
                                            : 'border-gray-200'
                                    }`}>

                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-[#1A2332]">
                                        {r.cliente?.nombre}
                                        {r.cliente?.apellido ? <span> {r.cliente.apellido}</span> : null}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {hoy && <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-300 px-2 py-0.5 rounded-full font-semibold">HOY</span>}
                                        {pasada && <span className="text-[9px] bg-red-50 text-red-600 border border-red-300 px-2 py-0.5 rounded-full font-semibold">VENCIDO</span>}
                                        <Badge variante={ESTADOS[r.estado]?.variante}>{ESTADOS[r.estado]?.label}</Badge>
                                    </div>
                                </div>

                                {/* Mini stepper */}
                                <div className="flex items-center gap-0 mb-3">
                                    {PASOS.map((paso, i) => (
                                        <div key={paso} className="flex items-center flex-1">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${i < pasoActual ? 'bg-green-500 text-white'
                                                    : i === pasoActual ? 'bg-[#F5C400] text-[#1A2332]'
                                                        : 'bg-gray-200 text-gray-400'
                                                }`}>
                                                {i < pasoActual ? '✓' : i + 1}
                                            </div>
                                            {i < PASOS.length - 1 && (
                                                <div className={`flex-1 h-0.5 ${i < pasoActual ? 'bg-green-400' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Neumáticos */}
                                {r.detalles?.map((d, i) => (
                                    <div key={i} className="text-xs text-gray-500 mb-1">
                                        <span>♻️ </span>
                                        <span>{d.marca} {d.medida}</span>
                                        {d.tipo_reencauche ? <span> · {d.tipo_reencauche}</span> : null}
                                        {d.dot ? <span> · DOT: {d.dot}</span> : null}
                                    </div>
                                ))}

                                {/* Fechas y cobro */}
                                <div className="grid grid-cols-2 gap-x-4 mt-2 text-xs">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Entrega est.</span>
                                        <span className={`font-medium ${pasada ? 'text-red-500' : hoy ? 'text-orange-500' : 'text-[#1A2332]'}`}>
                                            {formatFecha(r.fecha_entrega_estimada)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Saldo</span>
                                        <span className={`font-semibold ${saldo > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            ${saldo.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <Modal abierto={modalForm} onCerrar={() => setModalForm(false)}
                titulo="Nueva orden de reencauche" ancho="max-w-2xl">
                <FormReencauche
                    onGuardar={(data) => mutacionCrear.mutate(data)}
                    cargando={mutacionCrear.isPending}
                    onCancelar={() => setModalForm(false)}
                />
            </Modal>

            <Modal abierto={modalDetalle}
                onCerrar={() => { setModalDetalle(false); setSeleccionado(null) }}
                titulo="Detalle de reencauche" ancho="max-w-2xl">
                <DetalleReencauche
                    reencauche={seleccionado}
                    onCambiarEstado={(estado) => mutacionEstado.mutate({
                        id: seleccionado.id_reencauche, estado
                    })}
                    cargando={mutacionEstado.isPending}
                />
            </Modal>
        </div>
    )
}