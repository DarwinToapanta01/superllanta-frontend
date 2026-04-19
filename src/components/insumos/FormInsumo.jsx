import { useState, useEffect } from 'react'

export default function FormInsumo({ producto, categorias, onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({
        nombre: '', descripcion: '', id_categoria: '', unidad_medida: 'unidad',
        stock: 0, stock_minimo: 0, precio_compra: '', precio_venta: '', estado: true
    })

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

    const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

    const handleSubmit = (e) => {
        e.preventDefault()
        onGuardar({ ...form, id_categoria: form.id_categoria ? parseInt(form.id_categoria) : null })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Nombre del insumo *</label>
                    <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
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
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Stock mínimo</label>
                    <input type="number" min="0" value={form.stock_minimo} onChange={e => set('stock_minimo', parseInt(e.target.value))}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none" />
                    <p className="text-[10px] text-gray-400 mt-1">Para generar alertas</p>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Precio compra</label>
                    <input type="number" min="0" step="0.01" value={form.precio_compra} onChange={e => set('precio_compra', e.target.value)}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Precio venta</label>
                    <input type="number" min="0" step="0.01" value={form.precio_venta} onChange={e => set('precio_venta', e.target.value)}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none" />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Descripción</label>
                    <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="estadoCheck" checked={form.estado} onChange={e => set('estado', e.target.checked)}
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