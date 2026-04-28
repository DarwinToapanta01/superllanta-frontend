import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientesService } from '../../services/clientes'
import { productosService } from '../../services/productos'
import SelectorVehiculo from '../ui/SelectorVehiculo'
import BuscadorCliente from '../ui/BuscadorCliente'
import BuscadorMarca from '../ui/BuscadorMarca'
import BuscadorMedida from '../ui/BuscadorMedida'
import InputDOT from '../ui/InputDOT'
import { Wrench, RefreshCw, Plus, X, ChevronDown } from 'lucide-react'

export default function FormReparacion({ onGuardar, cargando, onCancelar }) {
    const [tipo, setTipo] = useState('arreglo')
    const [form, setForm] = useState({
        id_cliente: '',
        id_neumatico: null,
        marca_neumatico: '',
        medida_neumatico: '',
        dot_neumatico: '',
        dotValido: true,
        descripcion: '',
        costo: '',
        observaciones: ''
    })
    const [modoNeumatico, setModoNeumatico] = useState('existente') // 'existente' | 'nuevo'
    const [insumos, setInsumos] = useState([])
    const [cantidadCambios, setCantidadCambios] = useState(1)
    const [precioCambio, setPrecioCambio] = useState('')
    const [errores, setErrores] = useState({})

    const [idVehiculo, setIdVehiculo] = useState(null)
    const [tipoClienteSeleccionado, setTipoClienteSeleccionado] = useState('individual')

    const { data: clientes = [] } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => clientesService.listar().then(r => r.data)
    })

    const { data: neumaticosCliente = [], isLoading: cargandoNeumaticos } = useQuery({
        queryKey: ['neumaticos-cliente', form.id_cliente],
        queryFn: () => clientesService.neumaticos(form.id_cliente).then(r => r.data),
        enabled: !!form.id_cliente && tipo === 'arreglo',
    })

    const { data: productos = [] } = useQuery({
        queryKey: ['productos'],
        queryFn: () => productosService.listar({ estado: true }).then(r => r.data)
    })

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }))
        setErrores(e => ({ ...e, [k]: '' }))
    }

    const seleccionarNeumatico = (neu) => {
        setForm(f => ({
            ...f,
            id_neumatico: neu.id_neumatico,
            marca_neumatico: neu.marca || '',
            medida_neumatico: neu.medida || '',
            dot_neumatico: neu.dot || '',
            dotValido: true,
        }))
        setErrores({})
    }

    const limpiarNeumatico = () => {
        setForm(f => ({
            ...f,
            id_neumatico: null,
            marca_neumatico: '',
            medida_neumatico: '',
            dot_neumatico: '',
            dotValido: true,
        }))
    }

    const handleClienteChange = (id) => {
        set('id_cliente', id)
        limpiarNeumatico()
        setModoNeumatico('existente')
        setIdVehiculo(null)
        // Buscar tipo de cliente
        const cliente = clientes.find(c => c.id_cliente === parseInt(id))
        setTipoClienteSeleccionado(cliente?.tipo_cliente || 'individual')
        setModoNeumatico('existente')
    }

    const agregarInsumo = () => setInsumos(i => [...i, { id_producto: '', cantidad: 1 }])
    const eliminarInsumo = (i) => setInsumos(ins => ins.filter((_, idx) => idx !== i))
    const setInsumo = (i, k, v) => setInsumos(ins => ins.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

    const costoInsumos = insumos.reduce((sum, ins) => {
        const prod = productos.find(p => p.id_producto === parseInt(ins.id_producto))
        return sum + (parseFloat(prod?.precio_venta || 0) * (parseInt(ins.cantidad) || 0))
    }, 0)

    const totalCambio = (parseFloat(precioCambio) || 0) * (parseInt(cantidadCambios) || 0)

    const validar = () => {
        const e = {}
        if (!form.id_cliente) e.id_cliente = 'Selecciona un cliente'
        if (tipo === 'arreglo') {
            if (!form.marca_neumatico) e.marca_neumatico = 'Requerido'
            if (!form.medida_neumatico) e.medida_neumatico = 'Requerido'
            if (form.dot_neumatico && !form.dotValido) e.dot_neumatico = 'DOT inválido'
            if (insumos.length === 0) e.insumos = 'Agrega al menos un insumo'
            insumos.forEach((ins, i) => {
                if (!ins.id_producto) e[`insumo_prod_${i}`] = 'Requerido'
                if (!ins.cantidad || ins.cantidad < 1) e[`insumo_cant_${i}`] = 'Inválido'
            })
        }
        if (tipo === 'cambio') {
            if (!cantidadCambios || parseInt(cantidadCambios) < 1) e.cantidadCambios = 'Ingresa la cantidad'
            if (!precioCambio || parseFloat(precioCambio) <= 0) e.precioCambio = 'Ingresa el precio'
        }
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }

        onGuardar({
            id_cliente: parseInt(form.id_cliente),
            id_vehiculo: idVehiculo || null,
            id_neumatico: form.id_neumatico || null,
            tipo_reparacion: tipo,
            marca_neumatico: tipo === 'arreglo' ? form.marca_neumatico : null,
            medida_neumatico: tipo === 'arreglo' ? form.medida_neumatico : null,
            dot_neumatico: tipo === 'arreglo' ? (form.dot_neumatico || null) : null,
            descripcion: form.descripcion || null,
            costo: tipo === 'arreglo'
                ? (parseFloat(form.costo) || costoInsumos)
                : totalCambio,
            observaciones: form.observaciones || null,
            insumos: tipo === 'arreglo'
                ? insumos.map(i => ({ id_producto: parseInt(i.id_producto), cantidad: parseInt(i.cantidad) }))
                : [],
            detalles_cambio: tipo === 'cambio' ? [{
                cantidad_cambios: parseInt(cantidadCambios),
                precio_mano_obra: parseFloat(precioCambio),
                marca_desmontado: 'N/A', medida_desmontada: 'N/A',
                marca_montado: 'N/A', medida_montada: 'N/A',
                es_neumatico_propio: true,
            }] : []
        })
    }

    // Neumático seleccionado actualmente
    const neuSeleccionado = neumaticosCliente.find(n => n.id_neumatico === form.id_neumatico)

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

            {/* Selector tipo */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-2 uppercase tracking-wide">
                    Tipo de servicio *
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setTipo('arreglo')}
                        className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${tipo === 'arreglo' ? 'border-[#1C3F6E] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Wrench size={18} className={tipo === 'arreglo' ? 'text-[#1C3F6E]' : 'text-gray-400'} />
                        <span className="text-xs font-semibold text-[#1A2332]">Arreglo</span>
                        <span className="text-[10px] text-gray-500">Parches, moñones, válvulas</span>
                    </button>
                    <button type="button" onClick={() => setTipo('cambio')}
                        className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${tipo === 'cambio' ? 'border-[#E67E22] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <RefreshCw size={18} className={tipo === 'cambio' ? 'text-[#E67E22]' : 'text-gray-400'} />
                        <span className="text-xs font-semibold text-[#1A2332]">Cambio de neumático</span>
                        <span className="text-[10px] text-gray-500">Solo mano de obra</span>
                    </button>
                </div>
            </div>

            {/* Cliente */}
            <div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Cliente *
                    </label>
                    <BuscadorCliente
                        idCliente={form.id_cliente}
                        onChange={(id) => handleClienteChange(id)}
                        error={errores.id_cliente}
                    />
                    {errores.id_cliente && <p className="text-[10px] text-red-500 mt-1">{errores.id_cliente}</p>}
                </div>
                {errores.id_cliente && <p className="text-[10px] text-red-500 mt-1">{errores.id_cliente}</p>}
            </div>

            {/* Selector de vehículo — aparece solo si el cliente es empresa */}
            <SelectorVehiculo
                idCliente={form.id_cliente}
                tipoCliente={tipoClienteSeleccionado}
                idVehiculo={idVehiculo}
                onChange={setIdVehiculo}
                error={errores.idVehiculo}
            />

            {/* Selector de neumático — solo para arreglos */}
            {tipo === 'arreglo' && form.id_cliente && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-[#1C3F6E] uppercase tracking-wide">
                            Neumático a reparar
                        </div>
                        {/* Toggle existente / nuevo */}
                        {neumaticosCliente.length > 0 && (
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button type="button"
                                    onClick={() => { setModoNeumatico('existente'); limpiarNeumatico() }}
                                    className={`px-3 h-7 text-[10px] font-medium transition-colors ${modoNeumatico === 'existente' ? 'bg-[#1C3F6E] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                    Del cliente
                                </button>
                                <button type="button"
                                    onClick={() => { setModoNeumatico('nuevo'); limpiarNeumatico() }}
                                    className={`px-3 h-7 text-[10px] font-medium transition-colors ${modoNeumatico === 'nuevo' ? 'bg-[#1C3F6E] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                    Nuevo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Lista de neumáticos existentes del cliente */}
                    {modoNeumatico === 'existente' && (
                        <div>
                            {cargandoNeumaticos ? (
                                <div className="text-xs text-gray-400 text-center py-3">Buscando neumáticos...</div>
                            ) : neumaticosCliente.length === 0 ? (
                                <div className="text-center py-3">
                                    <p className="text-xs text-gray-500 mb-2">Este cliente no tiene neumáticos registrados</p>
                                    <button type="button"
                                        onClick={() => setModoNeumatico('nuevo')}
                                        className="text-xs text-[#2563A8] hover:underline flex items-center gap-1 mx-auto">
                                        <Plus size={11} /> Ingresar datos manualmente
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {neumaticosCliente.map(neu => (
                                        <div key={neu.id_neumatico}
                                            onClick={() => seleccionarNeumatico(neu)}
                                            className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${form.id_neumatico === neu.id_neumatico
                                                ? 'border-[#1C3F6E] bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-[#2563A8]'
                                                }`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${form.id_neumatico === neu.id_neumatico ? 'bg-[#1C3F6E]' : 'bg-gray-100'
                                                }`}>
                                                <Wrench size={13} className={form.id_neumatico === neu.id_neumatico ? 'text-white' : 'text-gray-400'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-[#1A2332]">
                                                    {neu.marca} · {neu.medida}
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                                                    {neu.dot && <span>DOT: {neu.dot}</span>}
                                                    <span className="font-mono text-[#2563A8]">{neu.codigo_qr}</span>
                                                </div>
                                            </div>
                                            {form.id_neumatico === neu.id_neumatico && (
                                                <div className="w-5 h-5 rounded-full bg-[#1C3F6E] flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-[10px] font-bold">✓</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button"
                                        onClick={() => { setModoNeumatico('nuevo'); limpiarNeumatico() }}
                                        className="w-full h-8 border border-dashed border-gray-300 rounded-lg text-[10px] text-gray-500 hover:border-[#2563A8] hover:text-[#2563A8] flex items-center justify-center gap-1 transition-colors">
                                        <Plus size={11} /> Agregar llanta diferente
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ingreso manual */}
                    {(modoNeumatico === 'nuevo' || neumaticosCliente.length === 0) && modoNeumatico !== 'existente' && (
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">MARCA *</label>
                                <BuscadorMarca
                                    value={form.marca_neumatico}
                                    onChange={v => set('marca_neumatico', v)}
                                    error={errores.marca_neumatico}
                                />
                                {errores.marca_neumatico && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">MEDIDA *</label>
                                <BuscadorMedida
                                    value={form.medida_neumatico}
                                    onChange={v => set('medida_neumatico', v)}
                                    error={errores.medida_neumatico}
                                />
                                {errores.medida_neumatico && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">DOT</label>
                                <InputDOT value={form.dot_neumatico}
                                    onChange={(val, esValido) => { set('dot_neumatico', val); set('dotValido', esValido) }}
                                    error={errores.dot_neumatico} />
                            </div>
                        </div>
                    )}

                    {/* Mostrar datos del neumático seleccionado */}
                    {modoNeumatico === 'existente' && form.id_neumatico && neuSeleccionado && (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">DESCRIPCIÓN DEL DAÑO</label>
                            </div>
                        </div>
                    )}

                    {/* Descripción del daño — siempre visible si hay neumático */}
                    {(form.marca_neumatico || form.id_neumatico) && (
                        <div className="mt-2">
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">DESCRIPCIÓN DEL DAÑO</label>
                            <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                                placeholder="Ej: Pinchazo lateral, válvula rota..."
                                className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs focus:outline-none" />
                        </div>
                    )}
                </div>
            )}

            {/* ARREGLO: insumos */}
            {tipo === 'arreglo' && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-[#1A2332] uppercase tracking-wide">
                            Insumos utilizados *
                        </label>
                        <button type="button" onClick={agregarInsumo}
                            className="text-xs text-[#2563A8] hover:underline flex items-center gap-1">
                            <Plus size={11} /> Agregar insumo
                        </button>
                    </div>
                    {errores.insumos && <p className="text-[10px] text-red-500 mb-2">{errores.insumos}</p>}
                    {insumos.length === 0 ? (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center text-xs text-gray-400">
                            Haz clic en "+ Agregar insumo" para registrar los materiales usados
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {insumos.map((ins, i) => (
                                <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                                    <select value={ins.id_producto}
                                        onChange={e => setInsumo(i, 'id_producto', e.target.value)}
                                        className={`flex-1 h-8 border rounded-lg px-2 text-xs focus:outline-none ${errores[`insumo_prod_${i}`] ? 'border-red-400' : 'border-gray-300'}`}>
                                        <option value="">Selecciona insumo</option>
                                        {productos.filter(p => p.estado && p.stock > 0).map(p => (
                                            <option key={p.id_producto} value={p.id_producto}>
                                                {p.nombre} (stock: {p.stock})
                                            </option>
                                        ))}
                                    </select>
                                    <input type="number" min="1" value={ins.cantidad}
                                        onChange={e => setInsumo(i, 'cantidad', e.target.value)}
                                        className={`w-16 h-8 border rounded-lg px-2 text-xs text-center focus:outline-none ${errores[`insumo_cant_${i}`] ? 'border-red-400' : 'border-gray-300'}`} />
                                    <button type="button" onClick={() => eliminarInsumo(i)}
                                        className="text-red-400 hover:text-red-600 p-1">
                                        <X size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {insumos.length > 0 && costoInsumos > 0 && (
                        <div className="flex items-center justify-between mt-2 px-3 py-2 bg-blue-50 rounded-lg">
                            <span className="text-xs text-[#1C3F6E]">Costo calculado por insumos</span>
                            <span className="text-xs font-bold text-[#1C3F6E]">${costoInsumos.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="mt-2">
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                            COSTO TOTAL <span className="font-normal text-gray-400">(puedes ajustarlo)</span>
                        </label>
                        <input type="number" min="0" step="0.50"
                            value={form.costo || costoInsumos}
                            onChange={e => set('costo', e.target.value)}
                            placeholder={costoInsumos.toFixed(2)}
                            className="w-32 h-8 border border-gray-300 rounded-lg px-2 text-xs focus:outline-none" />
                    </div>
                </div>
            )}

            {/* CAMBIO: cantidad y precio */}
            {tipo === 'cambio' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="text-xs font-semibold text-orange-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <RefreshCw size={13} /> Detalle del cambio
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                                Cantidad de cambios *
                            </label>
                            <input type="number" min="1" max="20" value={cantidadCambios}
                                onChange={e => { setCantidadCambios(e.target.value); setErrores(er => ({ ...er, cantidadCambios: '' })) }}
                                className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.cantidadCambios ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`} />
                            {errores.cantidadCambios && <p className="text-[10px] text-red-500 mt-1">{errores.cantidadCambios}</p>}
                            <p className="text-[10px] text-gray-500 mt-1">Número de neumáticos a cambiar</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                                Precio por cambio *
                            </label>
                            <input type="number" min="0" step="0.50" value={precioCambio}
                                onChange={e => { setPrecioCambio(e.target.value); setErrores(er => ({ ...er, precioCambio: '' })) }}
                                placeholder="0.00"
                                className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.precioCambio ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`} />
                            {errores.precioCambio && <p className="text-[10px] text-red-500 mt-1">{errores.precioCambio}</p>}
                            <p className="text-[10px] text-gray-500 mt-1">Mano de obra por unidad</p>
                        </div>
                    </div>
                    {cantidadCambios > 0 && precioCambio > 0 && (
                        <div className="mt-4 flex items-center justify-between bg-[#1C3F6E] rounded-lg px-4 py-3 text-white">
                            <span className="text-xs text-white/70">
                                {cantidadCambios} cambio{cantidadCambios > 1 ? 's' : ''} × ${parseFloat(precioCambio).toFixed(2)}
                            </span>
                            <span className="text-base font-bold text-[#F5C400]">
                                Total: ${totalCambio.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Observaciones */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                    Observaciones
                </label>
                <input value={form.observaciones} onChange={e => set('observaciones', e.target.value)}
                    placeholder="Notas adicionales..."
                    className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Guardando...' : 'Registrar reparación'}
                </button>
            </div>
        </form>
    )
}