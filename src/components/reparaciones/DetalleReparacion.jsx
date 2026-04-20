import Badge from '../ui/Badge'

export default function DetalleReparacion({ reparacion: r }) {
  if (!r) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1C3F6E] rounded-xl p-3 text-white">
          <div className="text-xs text-white/50 mb-1">Cliente</div>
          <div className="text-sm font-semibold">{r.cliente?.nombre} {r.cliente?.apellido || ''}</div>
          {r.cliente?.telefono && <div className="text-xs text-white/60 mt-0.5">📞 {r.cliente.telefono}</div>}
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Información</div>
          <div className="text-xs text-[#1A2332]">
            <div>Fecha: <span className="font-medium">{new Date(r.fecha).toLocaleDateString('es-EC')}</span></div>
            <div className="mt-0.5">Tipo: <Badge variante={r.tipo_reparacion === 'arreglo' ? 'info' : 'warning'}>
              {r.tipo_reparacion === 'arreglo' ? '🔧 Arreglo' : '🔄 Cambio'}
            </Badge></div>
          </div>
        </div>
      </div>

      {/* Neumático */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Neumático</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-[#1A2332]">{r.marca_neumatico} · {r.medida_neumatico}</span>
          {r.dot_neumatico && <span className="text-xs text-gray-500">DOT: {r.dot_neumatico}</span>}
        </div>
        {r.descripcion && (
          <div className="text-xs text-gray-500 mt-2 bg-white rounded px-2 py-1.5 border border-gray-200">
            📝 {r.descripcion}
          </div>
        )}
      </div>

      {/* Insumos usados (arreglo) */}
      {r.uso_productos?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Insumos utilizados</div>
          <div className="space-y-1">
            {r.uso_productos.map((u, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs">
                <span className="text-[#1A2332] font-medium">{u.producto?.nombre}</span>
                <div className="flex items-center gap-3 text-gray-500">
                  <span>x{u.cantidad}</span>
                  <span className="font-semibold text-[#1C3F6E]">
                    ${(parseFloat(u.producto?.precio_venta || 0) * u.cantidad).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalle cambio */}
      {r.detalles_cambio?.length > 0 && r.detalles_cambio.map((dc, i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-red-600 mb-1">⬇ DESMONTADO</div>
            <div className="text-xs font-medium text-[#1A2332]">{dc.marca_desmontado} · {dc.medida_desmontada}</div>
            {dc.dot_desmontado && <div className="text-[10px] text-gray-500">DOT: {dc.dot_desmontado}</div>}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-green-600 mb-1">⬆ MONTADO</div>
            <div className="text-xs font-medium text-[#1A2332]">{dc.marca_montado} · {dc.medida_montada}</div>
            {dc.dot_montado && <div className="text-[10px] text-gray-500">DOT: {dc.dot_montado}</div>}
            <div className="text-[10px] text-gray-500 mt-1">
              {dc.es_neumatico_propio ? 'Del cliente' : 'Del inventario'}
            </div>
          </div>
        </div>
      ))}

      {/* Costo y observaciones */}
      <div className="flex justify-between items-center bg-[#1C3F6E] rounded-xl px-4 py-3 text-white">
        <span className="text-sm font-medium">Costo total</span>
        <span className="text-lg font-bold text-[#F5C400]">${parseFloat(r.costo || 0).toFixed(2)}</span>
      </div>

      {r.observaciones && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
          📝 {r.observaciones}
        </div>
      )}
    </div>
  )
}