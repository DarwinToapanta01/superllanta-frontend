import { useState, useCallback } from 'react'

export default function useToast() {
    const [toast, setToast] = useState(null)

    const mostrar = useCallback((mensaje, tipo = 'success') => {
        setToast({ mensaje, tipo })
    }, [])

    const cerrar = useCallback(() => setToast(null), [])

    return { toast, mostrar, cerrar }
}