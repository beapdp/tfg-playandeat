import { NextResponse } from 'next/server';
import { RestaurantService } from '../services/restaurantService';

/* 
  CAPA DE CONTROLADOR (RESTAURANT CONTROLLER)
  El controlador se encarga de recibir las peticiones de la API, 
  llamar al servicio correspondiente y devolver la respuesta en formato JSON.
*/
export class RestaurantController {
  
  // Controlador para el listado y búsqueda
  static async handleGetRestaurants(req: Request) {
    try {
      // Extraemos los parámetros de búsqueda de la URL
      const { searchParams } = new URL(req.url);
      const ownerId = searchParams.get('ownerId');

      if (ownerId) {
        const data = await RestaurantService.getRestaurantsByOwner(ownerId);
        return NextResponse.json(data);
      }

      const filters = {
        ubicacion: searchParams.get('ubicacion') || undefined,
        comida: searchParams.get('comida') || undefined,
        entretenimiento: searchParams.get('entretenimiento') || undefined,
        categoria: searchParams.get('categoria') || undefined,
      };

      // Llamamos al servicio
      const data = await RestaurantService.getRestaurants(filters);
      
      // Devolvemos la respuesta exitosa
      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Manejar creación de nuevo restaurante (Backend)
  static async handleCreateRestaurant(req: Request) {
    try {
      const body = await req.json();
      const data = await RestaurantService.createRestaurant(body);
      return NextResponse.json({ message: 'Restaurante creado con éxito', data });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Controlador para el detalle de un restaurante
  static async handleGetRestaurantById(id: string) {
    try {
      const data = await RestaurantService.getRestaurantById(id);
      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
  }
}
