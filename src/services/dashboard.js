import api from './api'
export const dashboardService = {
    obtener: () => api.get('/dashboard')
}