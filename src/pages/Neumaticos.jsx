import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { neumaticosService } from '../services/neumaticos'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import Badge from '../components/ui/Badge'
import BuscadorCliente from '../components/ui/BuscadorCliente'
import BuscadorMarca from '../components/ui/BuscadorMarca'
import BuscadorMedida from '../components/ui/BuscadorMedida'
import InputDOT from '../components/ui/InputDOT'
import { ventasService } from '../services/ventas'
import { Plus, ShoppingCart, Edit2, History } from 'lucide-react'

export default function Neumaticos() {
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [modalForm, setModalForm] = useState(false)
    const [modalVenta, setModalVenta] = useState(false)
    const [seleccionado, setSeleccionado] = useState(null)
    const [editando, setEditando] = useState(null)
    const [buscar, setBuscar] = useState('')
    const [confirmarEliminar, setConfirmarEliminar] = useState(null)
    const [tab, setTab] = useState('inventario')
    const [filtroCliente, setFiltroCliente] = useState('')

    const { data: ventas = [], isLoading: cargandoVentas } = useQuery({
        queryKey: ['ventas', filtroCliente],
        queryFn: () => ventasService.listar(filtroCliente ? { id_cliente: filtroCliente } : {}).then(r => r.data),
        enabled: tab === 'ventas'
    })

    const { data: neumaticos = [], isLoading } = useQuery({
        queryKey: ['neumaticos-venta'],
        queryFn: () => neumaticosService.listarVenta().then(r => r.data)
    })

    const mutacionIngresar = useMutation({
        mutationFn: (data) => editando
            ? neumaticosService.actualizar(editando.id_neumatico, data)
            : neumaticosService.crearVenta(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['neumaticos-venta'])
            setModalForm(false)
            setEditando(null)
            mostrar(editando ? 'Neumático actualizado correctamente' : 'Neumático registrado en inventario')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al registrar', 'error')
    })

    const mutacionVenta = useMutation({
        mutationFn: (data) => neumaticosService.registrarVenta(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['neumaticos-venta'])
            setModalVenta(false)
            setSeleccionado(null)
            mostrar('Venta registrada correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al registrar venta', 'error')
    })

    const mutacionEliminar = useMutation({
        mutationFn: (id) => neumaticosService.eliminar(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['neumaticos-venta'])
            setConfirmarEliminar(null)
            mostrar(data.data.mensaje || 'Neumático eliminado correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al eliminar', 'error')
    })

    const filtrados = neumaticos.filter(n => {
        const texto = `${n.marca || ''} ${n.medida || ''} ${n.dot || ''}`.toLowerCase()
        return texto.includes(buscar.toLowerCase())
    })

    const disponibles = neumaticos.filter(n => n.estado === 'disponible').length

    const abrirEditar = (n) => {
        setEditando(n)
        setModalForm(true)
    }

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { num: neumaticos.length, label: 'Total en inventario', color: '#1C3F6E' },
                    { num: disponibles, label: 'Disponibles', color: '#27AE60' },
                    { num: neumaticos.length - disponibles, label: 'Vendidos', color: '#9ca3af' },
                ].map(({ num, label, color }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold" style={{ color }}>{num}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {[
                    { id: 'inventario', label: 'Inventario', icon: Plus },
                    { id: 'ventas', label: 'Historial de ventas', icon: History },
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
            {tab === 'inventario' && (
                <>
                    {/* Toolbar */}
                    <div className="flex items-center gap-3 mb-4">
                        <input value={buscar} onChange={e => setBuscar(e.target.value)}
                            placeholder="Buscar por marca, medida o DOT..."
                            className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
                        <button onClick={() => { setEditando(null); setModalForm(true) }}
                            className="h-9 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold px-4 rounded-lg flex items-center gap-2">
                            <Plus size={14} /> <span>Ingresar neumático</span>
                        </button>
                    </div>

                    {/* Tabla */}
                    {isLoading ? <Spinner /> : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {['Marca', 'Medida', 'DOT', 'P. Compra', 'P. Venta', 'Estado', 'Ingreso', 'Acciones'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrados.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                                            No hay neumáticos en inventario
                                        </td></tr>
                                    ) : filtrados.map((n, i) => (
                                        <tr key={n.id_neumatico} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                            <td className="px-4 py-3 font-medium text-[#1A2332]">{n.marca}</td>
                                            <td className="px-4 py-3 text-gray-600">{n.medida}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{n.dot || '—'}</td>
                                            <td className="px-4 py-3 text-gray-500">
                                                ${parseFloat(n.precio_compra || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-[#1C3F6E]">
                                                ${parseFloat(n.precio || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variante={n.estado === 'disponible' ? 'success' : 'gray'}>
                                                    {n.estado === 'disponible' ? 'Disponible' : 'Vendido'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {new Date(n.fecha_registro).toLocaleDateString('es-EC')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Editar — siempre disponible */}
                                                    <button onClick={() => abrirEditar(n)}
                                                        className="text-[#2563A8] text-xs hover:underline flex items-center gap-1">
                                                        <Edit2 size={11} /> <span>Editar</span>
                                                    </button>
                                                    {/* Vender — solo si disponible */}
                                                    {n.estado === 'disponible' && (
                                                        <>
                                                            <span className="text-gray-300">|</span>
                                                            <button onClick={() => { setSeleccionado(n); setModalVenta(true) }}
                                                                className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                                                                <ShoppingCart size={11} /> <span>Vender</span>
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* Eliminar — solo si disponible (no vendido) */}
                                                    {n.estado === 'disponible' && (
                                                        <>
                                                            <span className="text-gray-300">|</span>
                                                            <button onClick={() => setConfirmarEliminar(n)}
                                                                className="text-red-400 text-xs hover:underline hover:text-red-600">
                                                                Eliminar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {tab === 'ventas' && (
                <div className="space-y-4">
                    {/* Filtro por cliente */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Filtrar por cliente
                        </label>
                        <BuscadorCliente
                            idCliente={filtroCliente}
                            onChange={setFiltroCliente}
                            placeholder="Buscar cliente para ver sus compras..."
                        />
                    </div>

                    {/* Lista de ventas */}
                    {cargandoVentas ? <Spinner /> : ventas.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-sm text-gray-400">
                            {filtroCliente ? 'Este cliente no tiene compras registradas' : 'No hay ventas registradas'}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {['Fecha', 'Cliente', 'Neumático', 'Medida', 'DOT', 'Método pago', 'Total', 'Estado llanta'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventas.map((v, i) => (
                                        v.detalles.map((d, j) => (
                                            <tr key={`${v.id_venta}-${j}`} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    {new Date(v.fecha).toLocaleDateString('es-EC')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs font-medium text-[#1A2332]">
                                                        {v.cliente?.tipo_cliente === 'empresa'
                                                            ? v.cliente?.nombre_empresa
                                                            : `${v.cliente?.nombre} ${v.cliente?.apellido || ''}`
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-[#1A2332] text-xs">
                                                    {d.neumatico?.marca}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                                                    {d.neumatico?.medida}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                                    {d.neumatico?.dot || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.metodo_pago === 'Efectivo' ? 'bg-green-100 text-green-700'
                                                            : v.metodo_pago === 'Transferencia' ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {v.metodo_pago || 'Efectivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-[#1C3F6E] text-xs">
                                                    ${parseFloat(d.precio || 0).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variante={d.neumatico?.estado === 'vendido' ? 'gray' : 'success'}>
                                                        {d.neumatico?.estado || '—'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal ingresar / editar */}
            <Modal abierto={modalForm}
                onCerrar={() => { setModalForm(false); setEditando(null) }}
                titulo={editando ? 'Editar neumático' : 'Ingresar neumático al inventario'}
                ancho="max-w-md">
                <FormIngreso
                    neumatico={editando}
                    onGuardar={(data) => mutacionIngresar.mutate(data)}
                    cargando={mutacionIngresar.isPending}
                    onCancelar={() => { setModalForm(false); setEditando(null) }}
                />
            </Modal>

            {/* Modal venta */}
            <Modal abierto={modalVenta}
                onCerrar={() => { setModalVenta(false); setSeleccionado(null) }}
                titulo="Registrar venta" ancho="max-w-md">
                <FormVenta
                    neumatico={seleccionado}
                    onGuardar={(data) => mutacionVenta.mutate(data)}
                    cargando={mutacionVenta.isPending}
                    onCancelar={() => { setModalVenta(false); setSeleccionado(null) }}
                />
            </Modal>

            {/* Modal confirmar eliminar */}
            <Modal
                abierto={!!confirmarEliminar}
                onCerrar={() => setConfirmarEliminar(null)}
                titulo="Eliminar neumático"
                ancho="max-w-sm">
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <p className="text-2xl mb-2">⚠️</p>
                        <p className="text-sm font-semibold text-[#1A2332]">
                            ¿Eliminar {confirmarEliminar?.marca} {confirmarEliminar?.medida}?
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Si tiene historial asociado será desactivado. Si no, se eliminará permanentemente.
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setConfirmarEliminar(null)}
                            className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button
                            onClick={() => mutacionEliminar.mutate(confirmarEliminar.id_neumatico)}
                            disabled={mutacionEliminar.isPending}
                            className="h-9 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                            {mutacionEliminar.isPending ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ─── Formulario de ingreso / edición ─────────────────────────

function FormIngreso({ neumatico, onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({
        marca: neumatico?.marca || '',
        medida: neumatico?.medida || '',
        dot: neumatico?.dot || '',
        dotValido: true,
        precio: neumatico?.precio || '',
        precio_compra: neumatico?.precio_compra || ''
    })
    const [errores, setErrores] = useState({})

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrores(e => ({ ...e, [k]: '' })) }

    const validar = () => {
        const e = {}
        if (!form.marca.trim()) e.marca = 'Requerido'
        if (!form.medida) e.medida = 'Requerido'
        if (!form.precio || parseFloat(form.precio) <= 0) e.precio = 'Ingresa un precio válido'
        if (form.dot && !form.dotValido) e.dot = 'DOT inválido'
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }
        onGuardar({
            marca: form.marca.trim(),
            medida: form.medida,
            dot: form.dot || null,
            precio: parseFloat(form.precio),
            precio_compra: parseFloat(form.precio_compra) || null,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Marca *</label>
                    <BuscadorMarca
                        value={form.marca}
                        onChange={v => set('marca', v)}
                        error={errores.marca}
                    />
                    {errores.marca && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Medida *</label>
                    <BuscadorMedida
                        value={form.medida}
                        onChange={v => set('medida', v)}
                        error={errores.medida}
                    />
                    {errores.medida && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">DOT</label>
                    <InputDOT value={form.dot}
                        onChange={(val, esValido) => { set('dot', val); set('dotValido', esValido) }}
                        error={errores.dot} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Precio compra</label>
                    <input type="number" min="0" step="0.01" value={form.precio_compra}
                        onChange={e => set('precio_compra', e.target.value)} placeholder="0.00"
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Precio venta *</label>
                    <input type="number" min="0" step="0.01" value={form.precio}
                        onChange={e => set('precio', e.target.value)} placeholder="0.00"
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none ${errores.precio ? 'border-red-400' : 'border-gray-300'}`} />
                    {errores.precio && <p className="text-[10px] text-red-500 mt-0.5">{errores.precio}</p>}
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Guardando...' : neumatico ? 'Actualizar' : 'Registrar ingreso'}
                </button>
            </div>
        </form>
    )
}

// ─── Formulario de venta ──────────────────────────────────────

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Cheque']

function FormVenta({ neumatico, onGuardar, cargando, onCancelar }) {
    const [idCliente, setIdCliente] = useState('')
    const [metodoPago, setMetodoPago] = useState('Efectivo')
    const [errores, setErrores] = useState({})

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        if (!idCliente) err.cliente = 'Selecciona un cliente'
        if (Object.keys(err).length > 0) { setErrores(err); return }
        onGuardar({
            id_cliente: parseInt(idCliente),
            id_neumatico: neumatico.id_neumatico,
            precio: neumatico.precio,
            metodo_pago: metodoPago
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            {neumatico && (
                <div className="bg-[#1C3F6E] rounded-xl p-3 text-white">
                    <div className="text-xs text-white/50 mb-1">Neumático a vender</div>
                    <div className="text-sm font-semibold">{neumatico.marca} · {neumatico.medida}</div>
                    {neumatico.dot && <div className="text-xs text-white/60 mt-0.5">DOT: {neumatico.dot}</div>}
                    <div className="text-[#F5C400] font-bold mt-1">${parseFloat(neumatico.precio || 0).toFixed(2)}</div>
                </div>
            )}

            {/* Buscador de cliente */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                    Cliente *
                </label>
                <BuscadorCliente
                    idCliente={idCliente}
                    onChange={(id) => { setIdCliente(id); setErrores(e => ({ ...e, cliente: '' })) }}
                    error={errores.cliente}
                />
            </div>

            {/* Método de pago */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-2 uppercase tracking-wide">
                    Método de pago *
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {METODOS_PAGO.map(m => (
                        <button key={m} type="button" onClick={() => setMetodoPago(m)}
                            className={`h-10 rounded-xl border-2 text-xs font-semibold transition-all ${metodoPago === m
                                ? 'border-[#1C3F6E] bg-blue-50 text-[#1C3F6E]'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}>
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Registrando...' : 'Confirmar venta'}
                </button>
            </div>
        </form>
    )
}