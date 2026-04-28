import api from './api'

export const ventasService = {
    listar: (params) => api.get('/ventas', { params }),
    porCliente: (idCliente) => api.get('/ventas', { params: { id_cliente: idCliente } }),
}