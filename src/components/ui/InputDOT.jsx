import { useState, useEffect } from 'react'
import { validarDOT, calcularEdadDOT } from '../../utils/validaciones'

export default function InputDOT({ value, onChange, error: errorExterno }) {
    const [validacion, setValidacion] = useState({ valido: true, mensaje: '', info: '' })

    useEffect(() => {
        if (!value || value.length < 4) {
            setValidacion({ valido: true, mensaje: '', info: '' })
            return
        }
        if (value.length === 4) {
            const resultado = validarDOT(value)
            setValidacion(resultado)
        }
    }, [value])

    const handleChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4)
        // Solo notificar validez cuando hay 4 dígitos, si no, siempre true
        const esValido = val.length === 4 ? validarDOT(val).valido : true
        onChange(val, esValido)
    }

    const tieneError = (value?.length === 4 && !validacion.valido) || !!errorExterno
    const mostrarOk = value?.length === 4 && validacion.valido && !errorExterno
    const edad = mostrarOk ? calcularEdadDOT(value) : null

    return (
        <div>
            <input
                value={value || ''}
                onChange={handleChange}
                placeholder="SSAA"
                maxLength={4}
                className={`w-full h-8 border rounded-lg px-2 text-xs focus:outline-none focus:border-[#2563A8] text-center tracking-widest font-mono ${tieneError
                        ? 'border-red-400 bg-red-50'
                        : mostrarOk
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300'
                    }`}
            />
            {tieneError && (
                <p className="text-[10px] text-red-500 mt-0.5 leading-tight">
                    {validacion.mensaje || errorExterno}
                </p>
            )}
            {mostrarOk && (
                <p className="text-[10px] text-green-600 mt-0.5">
                    ✓ {validacion.info}{edad ? ` · ${edad} de antigüedad` : ''}
                </p>
            )}
            {(!value || value.length === 0) && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                    Semana + año (Ej: 0824 = sem. 8 del 2024)
                </p>
            )}
        </div>
    )
}