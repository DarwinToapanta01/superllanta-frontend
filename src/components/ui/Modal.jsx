import { useEffect } from 'react'

export default function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-lg' }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onCerrar() }
        if (abierto) document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [abierto, onCerrar])

    if (!abierto) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/45" onClick={onCerrar} />
            <div className={`relative bg-white rounded-xl border border-gray-200 shadow-lg w-full ${ancho} mx-4 max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-[#1A2332]">{titulo}</h3>
                    <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    )
}