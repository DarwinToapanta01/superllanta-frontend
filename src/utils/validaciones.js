// VALIDACIONES REUTILIZABLES - Superllanta

const AÑO_MINIMO_DOT = 20 // 2020 hacia atrás no se acepta

export const validarDOT = (dot) => {
    if (!dot || dot.trim() === '') return { valido: true, mensaje: '' } // opcional

    const limpio = dot.trim()
    if (!/^\d{4}$/.test(limpio)) {
        return { valido: false, mensaje: 'El DOT debe tener exactamente 4 dígitos (SSAA)' }
    }

    const semana = parseInt(limpio.substring(0, 2))
    const año = parseInt(limpio.substring(2, 4))

    if (semana < 1 || semana > 52) {
        return { valido: false, mensaje: 'La semana del DOT debe estar entre 01 y 52' }
    }

    // Año actual y semana actual
    const hoy = new Date()
    const añoActual = parseInt(hoy.getFullYear().toString().substring(2)) // ej: 25
    const semanaActual = Math.ceil(
        (hoy - new Date(hoy.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)
    )

    // No aceptar años futuros
    if (año > añoActual) {
        return { valido: false, mensaje: `El año del DOT (20${año}) no puede ser futuro` }
    }

    // No aceptar semana futura en el año actual
    if (año === añoActual && semana > semanaActual) {
        return {
            valido: false,
            mensaje: `La semana ${semana} del 20${año} aún no ha ocurrido (estamos en semana ${semanaActual})`
        }
    }

    // No aceptar llantas muy viejas (2020 hacia atrás)
    if (año <= AÑO_MINIMO_DOT) {
        return {
            valido: false,
            mensaje: `Llanta demasiado antigua (20${año}). No se aceptan llantas del año 2020 o anteriores`
        }
    }

    return {
        valido: true,
        mensaje: '',
        info: `Semana ${semana} del año 20${año}`
    }
}

export const calcularEdadDOT = (dot) => {
    if (!dot || dot.length !== 4) return null
    const semana = parseInt(dot.substring(0, 2))
    const año = 2000 + parseInt(dot.substring(2, 4))
    const fechaDOT = new Date(año, 0, 1 + (semana - 1) * 7)
    const diffMs = new Date() - fechaDOT
    const diffMeses = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
    if (diffMeses < 12) return `${diffMeses} meses`
    return `${Math.floor(diffMeses / 12)} año${Math.floor(diffMeses / 12) > 1 ? 's' : ''}`
}