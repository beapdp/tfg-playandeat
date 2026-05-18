'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// =========================================================================
// CORRECCIÓN TÉCNICA: El problema de los iconos de Leaflet en Next.js
// =========================================================================
// Por defecto, Leaflet busca las imágenes de los "pines" (marcadores) en rutas relativas que 
// fallan al compilar el proyecto en React/Next.js. Para solucionar este error tan común,
// sobrescribimos el icono por defecto creando un "customIcon" que apunta directamente
// a los servidores públicos (unpkg) de Leaflet. 
// Dato para la defensa: Esto demuestra resolución de problemas de integración de librerías de terceros.
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  lat: number | null;
  lng: number | null;
}

export default function RestaurantsMap({ restaurantes }: { restaurantes: Restaurant[] }) {
  // =========================================================================
  // GESTIÓN DE LA HIDRATACIÓN (Hydration) EN REACT
  // =========================================================================
  // Los mapas interactivos dependen del objeto `window` del navegador.
  // Next.js intenta renderizar todo en el servidor primero (donde `window` no existe).
  // Para evitar que el código "explote", usamos este truco: el estado `mounted`.
  const [mounted, setMounted] = useState(false);

  // El useEffect SÓLO se ejecuta en el navegador (cliente), nunca en el servidor.
  // Por tanto, cuando se ejecuta, sabemos con 100% de seguridad que estamos en el navegador.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Si aún no estamos en el navegador, devolvemos una caja gris de "Cargando..."
  // Así el servidor devuelve algo bonito en lugar de un error.
  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-3xl flex items-center justify-center animate-pulse">
        <p className="text-gray-400 font-bold">Cargando motor de mapa (Leaflet)...</p>
      </div>
    );
  }

  // =========================================================================
  // LIMPIEZA DE DATOS (Data Sanitization)
  // =========================================================================
  // Filtramos la lista: Solo nos quedamos con los restaurantes que tengan 
  // una latitud y longitud válidas. Evitamos que el mapa intente dibujar "en la nada".
  const mapData = restaurantes.filter(r => r.lat !== null && r.lng !== null);

  // Coordenadas del centro de España (Madrid) para inicializar la cámara del mapa
  const defaultCenter: [number, number] = [40.4168, -3.7038]; 
  const defaultZoom = 6;

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
      {/* 
        MapContainer: Es el "lienzo" principal de Leaflet. 
        scrollWheelZoom={false} evita que al hacer scroll en la página, hagamos zoom sin querer en el mapa.
      */}
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={false} 
        className="w-full h-full"
      >
        {/* 
          TileLayer: Es el proveedor de las "baldosas" (imágenes) del mapa. 
          Usamos OpenStreetMap, que es 100% gratuito y Open Source.
        */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 
          Iteramos sobre nuestros datos filtrados. 
          Por cada restaurante, dibujamos un Marker (Pin).
        */}
        {mapData.map((restaurante) => (
          <Marker 
            key={restaurante.id} 
            position={[restaurante.lat!, restaurante.lng!]} 
            icon={customIcon}
          >
            {/* Popup es la ventanita (bocadillo) que se abre al hacer clic en el Pin */}
            <Popup className="custom-popup">
              <div className="w-48 text-center p-1">
                <div className="w-full h-24 mb-2 overflow-hidden rounded-lg relative">
                  <img 
                    src={restaurante.image_url} 
                    alt={restaurante.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-secondary mb-1">{restaurante.name}</h3>
                <Link 
                  href={`/restaurantes/${restaurante.id}`}
                  className="block mt-2 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Ver Ficha
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
