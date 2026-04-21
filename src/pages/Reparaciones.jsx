import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reparacionesService } from '../services/reparaciones'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import FormReparacion from '../components/reparaciones/FormReparacion'
import DetalleReparacion from '../components/reparaciones/DetalleReparacion'
import VistaQR from '../components/trazabilidad/VistaQR'

const TIPOS = {
    arreglo: { label: 'Arreglo', variante: 'info' },
    cambio: { label: 'Cambio', variante: 'warning' },
}

export default function Reparaciones() {
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [filtroTipo, setFiltroTipo] = useState('')
    const [buscar, setBuscar] = useState('')
    const [modalForm, setModalForm] = useState(false)
    const [modalDetalle, setModalDetalle] = useState(false)
    const [seleccionado, setSeleccionado] = useState(null)
    const [qrNuevo, setQrNuevo] = useState(null)
    const [modalQR, setModalQR] = useState(false)

    const { data: reparaciones = [], isLoading } = useQuery({
        queryKey: ['reparaciones', filtroTipo],
        queryFn: () => reparacionesService.listar(
            filtroTipo ? { tipo: filtroTipo } : {}
        ).then(r => r.data)
    })

    const mutacionCrear = useMutation({
        mutationFn: (data) => reparacionesService.crear(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['reparaciones'])
            queryClient.invalidateQueries(['neumaticos-taller'])
            setModalForm(false)

            // Si se generó un QR nuevo, mostrarlo
            if (res.data.qr_generado) {
                setQrNuevo(res.data.qr_generado)
                setModalQR(true)
            } else {
                mostrar('Reparación registrada correctamente')
            }
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al guardar', 'error')
    })

    const filtradas = reparaciones.filter(r => {
        const texto = `${r.cliente?.nombre} ${r.cliente?.apellido || ''} ${r.marca_neumatico || ''}`.toLowerCase()
        return texto.includes(buscar.toLowerCase())
    })

    const conteo = (tipo) => reparaciones.filter(r => r.tipo_reparacion === tipo).length

    const abrirDetalle = (r) => { setSeleccionado(r); setModalDetalle(true) }

    const tabs = [
        { val: '', label: 'Todos', count: reparaciones.length },
        { val: 'arreglo', label: 'Arreglos', count: conteo('arreglo') },
        { val: 'cambio', label: 'Cambios', count: conteo('cambio') },
    ]

    const tabClase = (val) => {
        const activo = filtroTipo === val
        if (!activo) return 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
        if (val === '') return 'bg-[#1C3F6E] text-white border-[#1C3F6E]'
        if (val === 'arreglo') return 'bg-blue-50 text-blue-700 border-blue-400'
        return 'bg-orange-50 text-orange-700 border-orange-400'
    }

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { num: reparaciones.length, label: 'Total hoy', color: '#1C3F6E' },
                    { num: conteo('arreglo'), label: 'Arreglos', color: '#2563A8' },
                    { num: conteo('cambio'), label: 'Cambios de neumático', color: '#E67E22' },
                ].map(({ num, label, color }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold" style={{ color }}>{num}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-5">
                {tabs.map(({ val, label, count }) => (
                    <button key={val} onClick={() => setFiltroTipo(val)}
                        className={`flex items-center gap-2 h-8 px-4 rounded-full text-xs font-medium transition-colors border ${tabClase(val)}`}>
                        <span>{label}</span>
                        <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>
                    </button>
                ))}
                <input value={buscar} onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar por cliente o marca..."
                    className="flex-1 h-8 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:border-[#2563A8]" />
                <button onClick={() => setModalForm(true)}
                    className="h-9 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold px-4 rounded-lg transition-colors">
                    + Nueva reparación
                </button>
            </div>

            {/* Tabla */}
            {isLoading ? <Spinner /> : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {['Fecha', 'Cliente', 'Tipo', 'Neumático', 'Insumos usados', 'Costo', 'Acciones'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                                    {buscar || filtroTipo ? 'No se encontraron resultados' : 'No hay reparaciones registradas hoy'}
                                </td></tr>
                            ) : filtradas.map((r, i) => (
                                <tr key={r.id_reparacion}
                                    className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {new Date(r.fecha).toLocaleDateString('es-EC')}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-[#1A2332]">
                                        <span>{r.cliente?.nombre}</span>
                                        {r.cliente?.apellido ? <span> {r.cliente.apellido}</span> : null}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variante={TIPOS[r.tipo_reparacion]?.variante}>
                                            {TIPOS[r.tipo_reparacion]?.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        {r.marca_neumatico ? (
                                            <span>{r.marca_neumatico} {r.medida_neumatico}</span>
                                        ) : (
                                            <span className="text-gray-400">Sin registro</span>
                                        )}
                                        {r.dot_neumatico ? <span className="text-gray-400"> · DOT {r.dot_neumatico}</span> : null}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        {r.uso_productos?.length > 0 ? (
                                            <span>{r.uso_productos.length} insumo{r.uso_productos.length > 1 ? 's' : ''}</span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-[#1C3F6E]">
                                        ${parseFloat(r.costo || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => abrirDetalle(r)}
                                            className="text-[#2563A8] text-xs hover:underline">
                                            Ver detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal abierto={modalForm} onCerrar={() => setModalForm(false)}
                titulo="Nueva reparación" ancho="max-w-2xl">
                <FormReparacion
                    onGuardar={(data) => mutacionCrear.mutate(data)}
                    cargando={mutacionCrear.isPending}
                    onCancelar={() => setModalForm(false)}
                />
            </Modal>

            <Modal abierto={modalDetalle}
                onCerrar={() => { setModalDetalle(false); setSeleccionado(null) }}
                titulo="Detalle de reparación">
                <DetalleReparacion reparacion={seleccionado} />
            </Modal>

            {/* Modal QR generado automáticamente */}
            <Modal
                abierto={modalQR}
                onCerrar={() => { setModalQR(false); setQrNuevo(null); mostrar('Reparación registrada correctamente') }}
                titulo="QR generado para la llanta"
                ancho="max-w-md"
            >
                <VistaQR data={qrNuevo ? { neumatico: qrNuevo, qr_imagen: qrNuevo.qr_imagen, codigo_qr: qrNuevo.codigo_qr } : null} />
            </Modal>
        </div>
    )
}