import { useState } from 'react'

const MEDIDAS_PREDEFINIDAS = [
    // Transporte pesado (camión, tráiler, bus)
    '295/80R22.5', '315/80R22.5', '11R22.5', '12R22.5',
    '275/80R22.5', '385/65R22.5', '425/65R22.5', '445/65R22.5',
    '315/70R22.5', '295/60R22.5', '10.00R20', '11.00R20', '12.00R20',
    // Camioneta / SUV
    '265/70R17', '265/65R17', '245/70R16', '235/75R15',
    '285/70R17', '275/65R18', '255/70R16',
    // Auto
    '185/65R15', '195/65R15', '205/55R16', '205/60R16',
    '215/60R16', '225/45R17', '215/65R15',
]

export default function InputMedida({ value, onChange, error, placeholder = 'Selecciona o escribe la medida' }) {
    const [modo, setModo] = useState('selector') // 'selector' | 'libre'
    const [inputLibre, setInputLibre] = useState(value || '')

    const handleSelector = (val) => {
        if (val === '__otra__') {
            setModo('libre')
            setInputLibre('')
            onChange('')
        } else {
            onChange(val)
        }
    }

    const handleLibre = (val) => {
        setInputLibre(val)
        onChange(val)
    }

    const volverSelector = () => {
        setModo('selector')
        setInputLibre('')
        onChange('')
    }

    if (modo === 'libre') {
        return (
            <div>
                <div className="flex gap-1">
                    <input
                        value={inputLibre}
                        onChange={e => handleLibre(e.target.value.toUpperCase())}
                        placeholder="Ej: 225/75R16, 10.00R20..."
                        maxLength={20}
                        className={`flex-1 h-8 border rounded-lg px-2 text-xs focus:outline-none focus:border-[#2563A8] uppercase ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    <button type="button" onClick={volverSelector}
                        title="Volver al selector"
                        className="h-8 px-2 border border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-100">
                        ↩
                    </button>
                </div>
                <p className="text-[10px] text-blue-500 mt-0.5">Modo escritura libre · haz clic en ↩ para volver al selector</p>
            </div>
        )
    }

    return (
        <select
            value={value}
            onChange={e => handleSelector(e.target.value)}
            className={`w-full h-8 border rounded-lg px-2 text-xs focus:outline-none focus:border-[#2563A8] ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
        >
            <option value="">Selecciona medida</option>
            <optgroup label="Transporte pesado">
                {MEDIDAS_PREDEFINIDAS.slice(0, 13).map(m => <option key={m}>{m}</option>)}
            </optgroup>
            <optgroup label="Camioneta / SUV">
                {MEDIDAS_PREDEFINIDAS.slice(13, 20).map(m => <option key={m}>{m}</option>)}
            </optgroup>
            <optgroup label="Auto">
                {MEDIDAS_PREDEFINIDAS.slice(20).map(m => <option key={m}>{m}</option>)}
            </optgroup>
            <option value="__otra__">✏️ Otra medida (escribir)</option>
        </select>
    )
}