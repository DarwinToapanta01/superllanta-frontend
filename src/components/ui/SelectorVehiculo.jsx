import { useQuery } from '@tanstack/react-query'
import { clientesService } from '../../services/clientes'
import { Truck } from 'lucide-react'

const TIPOS = {
    camion: 'Camión', trailer: 'Tráiler',
    bus: 'Bus', volqueta: 'Volqueta', otro: 'Otro'
}

export default function SelectorVehiculo({ idCliente, tipoCliente, idVehiculo, onChange, error }) {
    const { data: vehiculos = [], isLoading } = useQuery({
        queryKey: ['vehiculos', idCliente],
        queryFn: () => clientesService.vehiculos(idCliente).then(r => r.data),
        enabled: !!idCliente && tipoCliente === 'empresa'
    })

    // Si no es empresa no mostrar nada
    if (tipoCliente !== 'empresa') return null

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
                <Truck size={13} className="text-orange-500" />
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                    Vehículo de la flota *
                </span>
            </div>

            {isLoading ? (
                <div className="text-xs text-gray-400 py-2">Cargando vehículos...</div>
            ) : vehiculos.length === 0 ? (
                <div className="text-xs text-orange-600 bg-orange-100 rounded-lg px-3 py-2">
                    Este cliente no tiene vehículos registrados en su flota. Regístralos primero en la sección de Clientes.
                </div>
            ) : (
                <div className="space-y-2">
                    {vehiculos.map(v => (
                        <div key={v.id_vehiculo}
                            onClick={() => onChange(v.id_vehiculo)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${idVehiculo === v.id_vehiculo
                                    ? 'border-orange-400 bg-white'
                                    : 'border-orange-200 bg-white hover:border-orange-300'
                                }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${idVehiculo === v.id_vehiculo ? 'bg-orange-500' : 'bg-orange-100'
                                }`}>
                                <Truck size={14} className={idVehiculo === v.id_vehiculo ? 'text-white' : 'text-orange-500'} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#1A2332]">{v.placa}</span>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {TIPOS[v.tipo_vehiculo] || v.tipo_vehiculo}
                                    </span>
                                </div>
                                {v.chofer ? (
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                        Chofer: <span className="font-medium">{v.chofer}</span>
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-gray-400 mt-0.5">Sin chofer asignado</div>
                                )}
                            </div>
                            {idVehiculo === v.id_vehiculo && (
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-[10px] font-bold">✓</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        </div>
    )
}