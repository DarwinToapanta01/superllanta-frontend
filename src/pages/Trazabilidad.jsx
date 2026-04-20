import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { neumaticosService } from '../services/neumaticos'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import FormNeumatico from '../components/trazabilidad/FormNeumatico'
import VistaQR from '../components/trazabilidad/VistaQR'
import Badge from '../components/ui/Badge'

export default function Trazabilidad() {
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [buscar, setBuscar] = useState('')
    const [modalForm, setModalForm] = useState(false)
    const [modalQR, setModalQR] = useState(false)
    const [seleccionado, setSeleccionado] = useState(null)
    const [qrData, setQrData] = useState(null)

    const { data: neumaticos = [], isLoading } = useQuery({
        queryKey: ['neumaticos-taller'],
        queryFn: () => neumaticosService.listarTaller().then(r => r.data)
    })

    const mutacionRegistrar = useMutation({
        mutationFn: (data) => neumaticosService.registrarTaller(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['neumaticos-taller'])
            setModalForm(false)
            setQrData(res.data)
            setModalQR(true)
            mostrar('Neumático registrado y QR generado correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al registrar', 'error')
    })

    const abrirQR = async (neu) => {
        try {
            const res = await neumaticosService.obtenerQR(neu.id_neumatico)
            setQrData({ neumatico: neu, qr_imagen: res.data.qr_imagen, codigo_qr: res.data.codigo_qr })
            setModalQR(true)
        } catch {
            mostrar('Error al obtener QR', 'error')
        }
    }

    const filtrados = neumaticos.filter(n => {
        const texto = `${n.marca || ''} ${n.medida || ''} ${n.codigo_qr || ''} ${n.cliente?.nombre || ''}`.toLowerCase()
        return texto.includes(buscar.toLowerCase())
    })

    const estadoVariante = (estado) => {
        if (estado === 'activo') return 'success'
        if (estado === 'en_servicio') return 'warning'
        return 'gray'
    }

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Info banner */}
            <div className="bg-[#1C3F6E] rounded-xl p-4 mb-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F5C400] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⬛</div>
                <div className="flex-1">
                    <div className="text-white font-semibold text-sm mb-1">Trazabilidad QR de neumáticos</div>
                    <div className="text-white/60 text-xs">Registra un neumático para generar su código QR único. Al escanearlo desde cualquier celular se mostrará su hoja de vida completa con todo el historial de servicios.</div>
                </div>
                <button onClick={() => setModalForm(true)}
                    className="h-9 bg-[#F5C400] hover:bg-yellow-400 text-[#1A2332] text-sm font-bold px-4 rounded-lg flex-shrink-0">
                    + Registrar neumático
                </button>
            </div>

            {/* Búsqueda */}
            <div className="flex items-center gap-3 mb-4">
                <input value={buscar} onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar por marca, medida, código QR o cliente..."
                    className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
                <div className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-3 h-9 flex items-center rounded-lg">
                    {filtrados.length} neumático{filtrados.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Tabla */}
            {isLoading ? <Spinner /> : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {['Código QR', 'Cliente', 'Marca / Medida', 'DOT', 'Estado', 'Registrado', 'Acciones'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                                    {buscar ? 'No se encontraron resultados' : 'No hay neumáticos registrados en el taller'}
                                </td></tr>
                            ) : filtrados.map((n, i) => (
                                <tr key={n.id_neumatico}
                                    className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs bg-blue-50 text-[#1C3F6E] border border-blue-200 px-2 py-1 rounded">
                                            {n.codigo_qr || '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-[#1A2332]">
                                        <span>{n.cliente?.nombre}</span>
                                        {n.cliente?.apellido ? <span> {n.cliente.apellido}</span> : null}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-[#1A2332]">{n.marca}</span>
                                        <span className="text-gray-500 text-xs"> · {n.medida}</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                        {n.dot || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variante={estadoVariante(n.estado)}>{n.estado}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {new Date(n.fecha_registro).toLocaleDateString('es-EC')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => abrirQR(n)}
                                            className="text-[#2563A8] text-xs hover:underline mr-3">
                                            Ver QR
                                        </button>
                                        <a href={`/qr/${n.codigo_qr}`} target="_blank" rel="noreferrer"
                                            className="text-green-600 text-xs hover:underline">
                                            Hoja de vida
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal registrar neumático */}
            <Modal abierto={modalForm} onCerrar={() => setModalForm(false)}
                titulo="Registrar neumático en taller" ancho="max-w-xl">
                <FormNeumatico
                    onGuardar={(data) => mutacionRegistrar.mutate(data)}
                    cargando={mutacionRegistrar.isPending}
                    onCancelar={() => setModalForm(false)}
                />
            </Modal>

            {/* Modal QR */}
            <Modal abierto={modalQR} onCerrar={() => { setModalQR(false); setQrData(null) }}
                titulo="Código QR generado" ancho="max-w-md">
                <VistaQR data={qrData} />
            </Modal>
        </div>
    )
}