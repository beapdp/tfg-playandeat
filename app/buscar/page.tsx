import { RestaurantService } from '@/lib/backend/services/restaurantService';
import RestaurantCard from '@/components/RestaurantCard';
import Link from 'next/link';

export const revalidate = 0; 

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  
  const filters = {
    ubicacion: params.ubicacion,
    comida: params.comida,
    entretenimiento: params.entretenimiento,
    categoria: params.categoria,
  };

  // LLAMADA AL SERVICIO (BACKEND)
  // En lugar de hacer la consulta aquí, delegamos en nuestra capa de servicios
  let restaurantes: any[] = [];
  let error: any = null;

  try {
    restaurantes = await RestaurantService.getRestaurants(filters);
  } catch (e) {
    error = e;
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 min-h-[60vh]">
      <div className="mb-8">
        <Link href="/" className="text-primary font-semibold hover:underline mb-4 inline-block">
          &larr; Volver al inicio
        </Link>
        <h1 className="text-3xl font-extrabold text-secondary">
          Resultados de tu búsqueda
        </h1>
        <p className="text-gray-500 mt-2">
          Hemos encontrado {restaurantes?.length || 0} restaurantes que encajan con lo que buscas.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          Error al buscar en la base de datos. Comprueba que las tablas estén creadas en Supabase.
        </div>
      ) : restaurantes && restaurantes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurantes.map((restaurante) => (
            // Reutilizamos nuestra tarjeta, pero adaptando los nombres de las columnas a como las lee Supabase
            <RestaurantCard 
              key={restaurante.id} 
              restaurant={{
                id: restaurante.id,
                name: restaurante.name,
                imageUrl: restaurante.image_url,
                rating: restaurante.rating,
                services: restaurante.services || []
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-secondary mb-2">Vaya, no hay resultados</h3>
          <p className="text-gray-500">Prueba a buscar con otros filtros menos restrictivos.</p>
        </div>
      )}
    </div>
  );
}
