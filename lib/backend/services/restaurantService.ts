import { supabase } from '@/lib/supabase';

/* 
  CAPA DE SERVICIO (RESTAURANT SERVICE)
  Esta clase se encarga de la lógica pura de acceso a datos en Supabase.
  Siguiendo las indicaciones del profesor, aquí es donde reside la "lógica de servicios".
*/
export class RestaurantService {
  
  // Obtener todos los restaurantes con filtros opcionales
  static async getRestaurants(filters: { 
    ubicacion?: string; 
    comida?: string; 
    entretenimiento?: string;
    categoria?: string;
  } = {}) {
    let query = supabase.from('restaurantes').select('*');

    if (filters.ubicacion) {
      query = query.ilike('location', `%${filters.ubicacion}%`);
    }
    
    if (filters.comida) {
      query = query.eq('food_type', filters.comida);
    } else if (filters.categoria) {
      query = query.eq('food_type', filters.categoria);
    }

    if (filters.entretenimiento) {
      query = query.contains('services', [filters.entretenimiento]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Obtener un restaurante por su ID
  static async getRestaurantById(id: string) {
    const { data, error } = await supabase
      .from('restaurantes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Lógica para Crear un restaurante nuevo (Backend)
  static async createRestaurant(restaurantData: any) {
    // Adaptamos los datos para que coincidan con los nombres de la base de datos
    const payload = {
      name: restaurantData.name,
      description: restaurantData.description,
      location: restaurantData.location,
      image_url: restaurantData.imageUrl,
      rating: restaurantData.rating || 5.0,
      food_type: restaurantData.foodType,
      services: restaurantData.services || [],
      owner_id: restaurantData.ownerId // Relacionamos con el usuario que lo crea
    };

    const { data, error } = await supabase
      .from('restaurantes')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Lógica para obtener los restaurantes de un dueño específico (Backend)
  static async getRestaurantsByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('restaurantes')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) throw error;
    return data || [];
  }
}
