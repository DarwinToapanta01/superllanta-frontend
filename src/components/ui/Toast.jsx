import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const tipos = {
    success: { bg: 'bg-green-50 border-green-400', Icon: CheckCircle, text: 'text-green-800' },
    error: { bg: 'bg-red-50 border-red-400', Icon: XCircle, text: 'text-red-800' },
    warning: { bg: 'bg-yellow-50 border-yellow-400', Icon: AlertTriangle, text: 'text-yellow-800' },
    info: { bg: 'bg-blue-50 border-blue-400', Icon: Info, text: 'text-blue-800' },
}

export default function Toast({ mensaje, tipo = 'success', onCerrar }) {
    useEffect(() => {
        const t = setTimeout(onCerrar, 4000)
        return () => clearTimeout(t)
    }, [onCerrar])

    const { bg, Icon, text } = tipos[tipo]

    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} shadow-md max-w-sm`}>
            <Icon size={16} className={text} />
            <span className={`text-sm font-medium flex-1 ${text}`}>{mensaje}</span>
            <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 ml-2"><X size={14} /></button>
        </div>
    )
}