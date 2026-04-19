import { useState, useEffect } from 'react'

const STOCK_MINIMO_MAX = 50
const PRECIO_MAX = 999.99

export default function FormInsumo({ producto, categorias, onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({
        nombre: '', descripcion: '', id_categoria: '', unidad_medida: 'unidad',
        stock: 0, stock_minimo: 0, precio_compra: '', precio_venta: '', estado: true
    })
    const [errores, setErrores] = useState({})

    useEffect(() => {
        if (producto) setForm({
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            id_categoria: producto.id_categoria || '',
            unidad_medida: producto.unidad_medida || 'unidad',
            stock: producto.stock || 0,
            stock_minimo: producto.stock_minimo || 0,
            precio_compra: producto.precio_compra || '',
            precio_venta: producto.precio_venta || '',
            estado: producto.estado ?? true
        })
    }, [producto])

    const set = (campo, valor) => {
        setForm(f => ({ ...f, [campo]: valor }))
        setErrores(e => ({ ...e, [campo]: '' }))
    }

    const validar = () => {
        const e = {}
        if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
        if (form.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres'
        if (form.stock_minimo < 0) e.stock_minimo = 'No puede ser negativo'
        if (form.stock_minimo > STOCK_MINIMO_MAX) e.stock_minimo = `El stock mínimo no puede superar ${STOCK_MINIMO_MAX} unidades`
        if (form.stock < 0) e.stock = 'No puede ser negativo'
        if (form.precio_compra && (isNaN(form.precio_compra) || parseFloat(form.precio_compra) < 0))
            e.precio_compra = 'Ingresa un precio válido'
        if (form.precio_compra && parseFloat(form.precio_compra) > PRECIO_MAX)
            e.precio_compra = `El precio no puede superar $${PRECIO_MAX}`
        if (form.precio_venta && parseFloat(form.precio_venta) < 0)
            e.precio_venta = 'Ingresa un precio válido'
        if (form.precio_venta && parseFloat(form.precio_venta) > PRECIO_MAX)
            e.precio_venta = `El precio no puede superar $${PRECIO_MAX}`
        if (form.precio_compra && form.precio_venta &&
            parseFloat(form.precio_venta) < parseFloat(form.precio_compra))
            e.precio_venta = 'El precio de venta no puede ser menor al de compra'
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }
        onGuardar({ ...form, id_categoria: form.id_categoria ? parseInt(form.id_categoria) : null })
    }

    const campo = (label, key, props = {}) => (
        <div>
            <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">{label}</label>
            <input
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                {...props}
            />
            {errores[key] && <p className="text-[10px] text-red-500 mt-1">{errores[key]}</p>}
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Nombre del insumo *</label>
                    <input
                        value={form.nombre}
                        onChange={e => set('nombre', e.target.value)}
                        maxLength={150}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errores.nombre && <p className="text-[10px] text-red-500 mt-1">{errores.nombre}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Categoría</label>
                    <select value={form.id_categoria} onChange={e => set('id_categoria', e.target.value)}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none">
                        <option value="">Sin categoría</option>
                        {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Unidad de medida</label>
                    <select value={form.unidad_medida} onChange={e => set('unidad_medida', e.target.value)}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none">
                        {['unidad', 'litro', 'kg', 'metro', 'caja'].map(u => <option key={u}>{u}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Stock mínimo <span className="text-gray-400 normal-case font-normal">(máx. {STOCK_MINIMO_MAX})</span>
                    </label>
                    <input
                        type="number" min="0" max={STOCK_MINIMO_MAX}
                        value={form.stock_minimo}
                        onChange={e => set('stock_minimo', parseInt(e.target.value) || 0)}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.stock_minimo ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errores.stock_minimo
                        ? <p className="text-[10px] text-red-500 mt-1">{errores.stock_minimo}</p>
                        : <p className="text-[10px] text-gray-400 mt-1">Para generar alertas de reposición</p>
                    }
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Precio compra <span className="text-gray-400 normal-case font-normal">(máx. ${PRECIO_MAX})</span>
                    </label>
                    <input
                        type="number" min="0" max={PRECIO_MAX} step="0.01"
                        value={form.precio_compra}
                        onChange={e => set('precio_compra', e.target.value)}
                        placeholder="0.00"
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.precio_compra ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errores.precio_compra && <p className="text-[10px] text-red-500 mt-1">{errores.precio_compra}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Precio venta</label>
                    <input
                        type="number" min="0" max={PRECIO_MAX} step="0.01"
                        value={form.precio_venta}
                        onChange={e => set('precio_venta', e.target.value)}
                        placeholder="0.00"
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.precio_venta ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errores.precio_venta && <p className="text-[10px] text-red-500 mt-1">{errores.precio_venta}</p>}
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Descripción</label>
                    <textarea
                        value={form.descripcion}
                        onChange={e => set('descripcion', e.target.value)}
                        maxLength={300} rows={2}
                        placeholder="Descripción opcional del insumo..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                    />
                </div>

                <div className="col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="estadoCheck" checked={form.estado}
                        onChange={e => set('estado', e.target.checked)}
                        className="w-4 h-4 accent-[#1C3F6E]" />
                    <label htmlFor="estadoCheck" className="text-sm text-[#1A2332]">Producto activo</label>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Guardando...' : 'Guardar insumo'}
                </button>
            </div>
        </form>
    )
}