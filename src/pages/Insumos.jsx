import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosService } from '../services/productos'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import FormInsumo from '../components/insumos/FormInsumo'
import FormMovimiento from '../components/insumos/FormMovimiento'

export default function Insumos() {
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [buscar, setBuscar] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [filtroStock, setFiltroStock] = useState('')
    const [modalForm, setModalForm] = useState(false)
    const [modalMovimiento, setModalMovimiento] = useState(false)
    const [productoSeleccionado, setProductoSeleccionado] = useState(null)

    const { data: productos = [], isLoading } = useQuery({
        queryKey: ['productos'],
        queryFn: () => productosService.listar().then(r => r.data)
    })

    const { data: categorias = [] } = useQuery({
        queryKey: ['categorias'],
        queryFn: () => productosService.categorias().then(r => r.data)
    })

    const mutacionCrear = useMutation({
        mutationFn: (data) => productoSeleccionado
            ? productosService.actualizar(productoSeleccionado.id_producto, data)
            : productosService.crear(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['productos'])
            setModalForm(false)
            setProductoSeleccionado(null)
            mostrar(productoSeleccionado ? 'Insumo actualizado correctamente' : 'Insumo creado correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al guardar', 'error')
    })

    const mutacionMovimiento = useMutation({
        mutationFn: ({ id, data }) => productosService.registrarMovimiento(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['productos'])
            setModalMovimiento(false)
            setProductoSeleccionado(null)
            mostrar('Movimiento registrado correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al registrar movimiento', 'error')
    })

    const mutacionEliminar = useMutation({
        mutationFn: (id) => productosService.eliminar(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['productos'])
            mostrar(data.data.mensaje || 'Insumo eliminado correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al eliminar', 'error')
    })

    const [confirmarEliminar, setConfirmarEliminar] = useState(null)
    // Filtros locales
    const productosFiltrados = productos.filter(p => {
        const coincideBuscar = p.nombre.toLowerCase().includes(buscar.toLowerCase())
        const coincideCategoria = !filtroCategoria || p.id_categoria === parseInt(filtroCategoria)
        const coincideStock = !filtroStock ||
            (filtroStock === 'bajo' && p.stock <= p.stock_minimo && p.stock > 0) ||
            (filtroStock === 'sin' && p.stock === 0) ||
            (filtroStock === 'normal' && p.stock > p.stock_minimo)
        return coincideBuscar && coincideCategoria && coincideStock
    })

    const estadoStock = (p) => {
        if (p.stock === 0) return <Badge variante="danger">Sin stock</Badge>
        if (p.stock <= p.stock_minimo) return <Badge variante="warning">Stock bajo</Badge>
        return <Badge variante="success">Normal</Badge>
    }

    const abrirEditar = (producto) => {
        setProductoSeleccionado(producto)
        setModalForm(true)
    }

    const abrirMovimiento = (producto) => {
        setProductoSeleccionado(producto)
        setModalMovimiento(true)
    }

    const abrirNuevo = () => {
        setProductoSeleccionado(null)
        setModalForm(true)
    }

    // Estadísticas rápidas
    const total = productos.length
    const normal = productos.filter(p => p.stock > p.stock_minimo).length
    const bajo = productos.filter(p => p.stock <= p.stock_minimo && p.stock > 0).length
    const sinStock = productos.filter(p => p.stock === 0).length

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Estadísticas */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { num: total, label: 'Total productos', color: '#1C3F6E' },
                    { num: normal, label: 'Stock normal', color: '#27AE60' },
                    { num: bajo, label: 'Stock bajo', color: '#E67E22' },
                    { num: sinStock, label: 'Sin stock', color: '#E74C3C' },
                ].map(({ num, label, color }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold" style={{ color }}>{num}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-4">
                <input
                    value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar insumo..."
                    className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]"
                />
                <select
                    value={filtroCategoria}
                    onChange={e => setFiltroCategoria(e.target.value)}
                    className="h-9 border border-gray-300 rounded-lg px-3 text-sm text-gray-600 focus:outline-none"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
                <select
                    value={filtroStock}
                    onChange={e => setFiltroStock(e.target.value)}
                    className="h-9 border border-gray-300 rounded-lg px-3 text-sm text-gray-600 focus:outline-none"
                >
                    <option value="">Todo el stock</option>
                    <option value="normal">Stock normal</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="sin">Sin stock</option>
                </select>
                <button
                    onClick={abrirNuevo}
                    className="h-9 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold px-4 rounded-lg transition-colors"
                >
                    + Agregar insumo
                </button>
            </div>

            {/* Tabla */}
            {isLoading ? <Spinner /> : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {['Producto', 'Categoría', 'Stock actual', 'Stock mínimo', 'P. compra', 'P. venta', 'Estado', 'Acciones'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {productosFiltrados.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No se encontraron insumos</td></tr>
                            ) : productosFiltrados.map((p, i) => (
                                <tr key={p.id_producto} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                    <td className="px-4 py-3 font-medium text-[#1A2332]">{p.nombre}</td>
                                    <td className="px-4 py-3"><Badge variante="info">{p.categoria?.nombre || '—'}</Badge></td>
                                    <td className="px-4 py-3 font-semibold" style={{ color: p.stock === 0 ? '#E74C3C' : p.stock <= p.stock_minimo ? '#E67E22' : '#1A2332' }}>{p.stock}</td>
                                    <td className="px-4 py-3 text-gray-500">{p.stock_minimo}</td>
                                    <td className="px-4 py-3 text-gray-600">${parseFloat(p.precio_compra || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-gray-600">${parseFloat(p.precio_venta || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3">{estadoStock(p)}</td>
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        <button onClick={() => abrirEditar(p)} className="text-[#2563A8] text-xs hover:underline">Editar</button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={() => abrirMovimiento(p)} className="text-[#2563A8] text-xs hover:underline">Movimiento</button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={() => setConfirmarEliminar(p)} className="text-red-400 text-xs hover:underline hover:text-red-600">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal formulario */}
            <Modal
                abierto={modalForm}
                onCerrar={() => { setModalForm(false); setProductoSeleccionado(null) }}
                titulo={productoSeleccionado ? 'Editar insumo' : 'Agregar insumo'}
            >
                <FormInsumo
                    producto={productoSeleccionado}
                    categorias={categorias}
                    onGuardar={(data) => mutacionCrear.mutate(data)}
                    cargando={mutacionCrear.isPending}
                    onCancelar={() => { setModalForm(false); setProductoSeleccionado(null) }}
                />
            </Modal>

            {/* Modal movimiento */}
            <Modal
                abierto={modalMovimiento}
                onCerrar={() => { setModalMovimiento(false); setProductoSeleccionado(null) }}
                titulo={`Registrar movimiento — ${productoSeleccionado?.nombre}`}
            >
                <FormMovimiento
                    producto={productoSeleccionado}
                    onGuardar={(data) => mutacionMovimiento.mutate({ id: productoSeleccionado.id_producto, data })}
                    cargando={mutacionMovimiento.isPending}
                    onCancelar={() => { setModalMovimiento(false); setProductoSeleccionado(null) }}
                />
            </Modal>

            {/* Modal confirmar eliminar */}
            <Modal
                abierto={!!confirmarEliminar}
                onCerrar={() => setConfirmarEliminar(null)}
                titulo="Eliminar insumo"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <p className="text-2xl mb-2">⚠️</p>
                        <p className="text-sm font-semibold text-[#1A2332]">
                            ¿Eliminar "{confirmarEliminar?.nombre}"?
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Si tiene historial de movimientos o fue usado en servicios, será <strong>desactivado</strong> en lugar de eliminado permanentemente.
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setConfirmarEliminar(null)}
                            className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                mutacionEliminar.mutate(confirmarEliminar.id_producto)
                                setConfirmarEliminar(null)
                            }}
                            disabled={mutacionEliminar.isPending}
                            className="h-9 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                        >
                            {mutacionEliminar.isPending ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}