export default function Spinner({ texto = 'Cargando...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1C3F6E] rounded-full animate-spin mb-3"></div>
            <span className="text-sm">{texto}</span>
        </div>
    )
}