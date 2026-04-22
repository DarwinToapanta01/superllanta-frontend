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

// Si el token expira redirige al login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 && error.response?.data?.codigo === 'FUERA_HORARIO') {
            // Emitir evento global para que el Layout muestre la pantalla de horario
            window.dispatchEvent(new CustomEvent('fuera-horario', {
                detail: error.response.data
            }))
        }
        return Promise.reject(error)
    }
)

export default api