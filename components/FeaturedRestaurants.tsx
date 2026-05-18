import RestaurantCard from './RestaurantCard';
import { RestaurantService } from '@/lib/backend/services/restaurantService';

export default async function FeaturedRestaurants() {
  // Cargamos los restaurantes reales de la base de datos
  let restaurantes = [];
  try {
    restaurantes = await RestaurantService.getRestaurants();
  } catch (error) {
    console.error("Error cargando destacados:", error);
  }

  // Si no hay ninguno, mostramos un mensaje amigable
  if (restaurantes.length === 0) {
    return null; // O un mensaje de "No hay restaurantes destacados"
  }

  return (
    <section className="w-full max-w-6xl mx-auto mt-16 md:mt-24 px-4">
      <h2 className="text-2xl md:text-3xl font-extrabold text-secondary mb-8">
        Restaurantes Destacados
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {restaurantes.map((restaurant: any) => (
          <RestaurantCard 
            key={restaurant.id} 
            restaurant={{
              id: restaurant.id,
              name: restaurant.name,
              imageUrl: restaurant.image_url, // Mapeamos image_url de la BD a imageUrl del componente
              rating: restaurant.rating || 0, // <-- Cambiado de 5 a 0 para restaurantes sin opiniones
              services: restaurant.services || []
            }} 
          />
        ))}
      </div>
    </section>
  );
}
