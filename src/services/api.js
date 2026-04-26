import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
})

// Agrega el token JWT automáticamente a cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Manejo de respuestas y errores globales
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 && error.response?.data?.codigo === 'FUERA_HORARIO') {
            // Verificar si el usuario es administrador antes de bloquear
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    if (payload.rol === 'administrador') {
                        return Promise.reject(error) // Admin nunca ve pantalla de bloqueo
                    }
                } catch { }
            }
            // Solo bloquear a técnicos
            window.dispatchEvent(new CustomEvent('fuera-horario', {
                detail: error.response.data
            }))
        }
        return Promise.reject(error)
    }
)

export default api