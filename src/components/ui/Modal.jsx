import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-lg' }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onCerrar() }
        if (abierto) {
            document.addEventListener('keydown', handleKey)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = ''
        }
    }, [abierto, onCerrar])

    if (!abierto) return null

    return createPortal(
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            {/* Overlay */}
            <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
                onClick={onCerrar}
            />
            {/* Contenedor del modal */}
            <div
                style={{ position: 'relative', background: '#fff', borderRadius: '12px', border: '0.5px solid #e2e6ea', width: '100%', maxHeight: '90vh', overflowY: 'auto', margin: '0 16px' }}
                className={ancho}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '0.5px solid #f0f2f5' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1A2332', margin: 0 }}>
                        {String(titulo || '')}
                    </h3>
                    <button
                        onClick={onCerrar}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                    >
                        <X size={16} />
                    </button>
                </div>
                {/* Contenido */}
                <div style={{ padding: '20px' }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}