import { ClipboardList, Printer, Smartphone } from 'lucide-react'

export default function VistaQR({ data }) {
    if (!data) return null

    const { neumatico, qr_imagen, codigo_qr } = data

    const imprimir = () => {
        const ventana = window.open('', '_blank')
        ventana.document.write(`
      <html><head><title>QR - ${codigo_qr}</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 30px; }
        img { width: 200px; height: 200px; }
        .codigo { font-family: monospace; font-size: 14px; margin: 10px 0; letter-spacing: 2px; }
        .info { font-size: 12px; color: #666; margin: 4px 0; }
        .titulo { font-size: 18px; font-weight: bold; color: #1C3F6E; margin-bottom: 10px; }
        @media print { button { display: none; } }
      </style></head>
      <body>
        <div class="titulo">Superllanta</div>
        <img src="${qr_imagen}" alt="QR" />
        <div class="codigo">${codigo_qr}</div>
        <div class="info">${neumatico?.marca || ''} · ${neumatico?.medida || ''}</div>
        ${neumatico?.dot ? `<div class="info">DOT: ${neumatico.dot}</div>` : ''}
        <div class="info">${neumatico?.cliente?.nombre || ''}</div>
        <br/>
        <button onclick="window.print()">Imprimir</button>
      </body></html>
    `)
        ventana.document.close()
        ventana.focus()
        setTimeout(() => ventana.print(), 500)
    }

    return (
        <div className="text-center space-y-4">
            {/* QR imagen */}
            <div className="flex justify-center">
                <div className="bg-white border-2 border-[#1C3F6E] rounded-xl p-4 inline-block">
                    <img src={qr_imagen} alt={codigo_qr} className="w-48 h-48" />
                </div>
            </div>

            {/* Código */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Código único</div>
                <div className="font-mono text-lg font-bold text-[#1C3F6E] tracking-widest">{codigo_qr}</div>
            </div>

            {/* Info del neumático */}
            {neumatico && (
                <div className="bg-[#1C3F6E] rounded-xl p-3 text-white text-sm">
                    <div className="font-semibold">{neumatico.marca} · {neumatico.medida}</div>
                    {neumatico.dot && <div className="text-white/60 text-xs mt-1">DOT: {neumatico.dot}</div>}
                    {neumatico.cliente && (
                        <div className="text-white/60 text-xs mt-1">
                            Cliente: {neumatico.cliente.nombre} {neumatico.cliente.apellido || ''}
                        </div>
                    )}
                </div>
            )}

            {/* Instrucciones */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 text-left">
                <div className="font-semibold mb-1 flex items-center gap-1"><ClipboardList size={13} /> Instrucciones:</div>
                <div>1. Imprime este QR y adhiérelo a la llanta</div>
                <div>2. Al escanear con cualquier celular se abrirá la hoja de vida</div>
                <div>3. El historial se actualiza automáticamente con cada servicio</div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
                <button onClick={imprimir}
                    className="flex-1 h-10 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Printer size={15} /> Imprimir QR
                </button>
                <a href={`/qr/${codigo_qr}`} target="_blank" rel="noreferrer"
                    className="flex-1 h-10 border border-[#1C3F6E] text-[#1C3F6E] text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                    <Smartphone size={15} /> Ver hoja de vida
                </a>
            </div>
        </div>
    )
}