'use client';

import dynamic from 'next/dynamic';

// Importación dinámica CRÍTICA para mapas en Next.js (evita que el servidor intente renderizar la librería Leaflet)
// En las versiones recientes de Next.js, esta importación con ssr: false DEBE hacerse dentro de un Client Component.
const DynamicMap = dynamic(() => import('@/components/RestaurantsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-3xl flex items-center justify-center animate-pulse">
      <p className="text-gray-400 font-bold">Cargando mapa interactivo...</p>
    </div>
  )
});

export default function MapWrapper({ restaurantes }: { restaurantes: any[] }) {
  return <DynamicMap restaurantes={restaurantes} />;
}
