import Link from 'next/link';
import { MapPin, ArrowLeft } from 'lucide-react';
import { RestaurantService } from '@/lib/backend/services/restaurantService';
import MapWrapper from '@/components/MapWrapper';

// Forzamos que esta página se renderice dinámicamente en el servidor para obtener los datos más frescos
export const dynamic = 'force-dynamic';

export default async function MapaPage() {
  // Obtenemos todos los restaurantes desde la capa de servicios
  const restaurantes = await RestaurantService.getRestaurants();

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <Link href="/" className="flex items-center gap-2 text-primary font-bold hover:underline mb-8">
        <ArrowLeft size={20} />
        Volver al Inicio
      </Link>
      
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-secondary flex items-center gap-3">
          <MapPin className="text-primary" size={40} />
          Mapa Interactivo
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Descubre los mejores restaurantes con zona de ocio infantil a tu alrededor.
        </p>
      </div>

      {/* Renderizamos el componente del mapa pasándole los datos a través del Wrapper (Cliente) */}
      <MapWrapper restaurantes={restaurantes} />
    </div>
  );
}
