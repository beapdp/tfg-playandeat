import { RestaurantController } from '@/lib/backend/controllers/restaurantController';

/* 
  RUTA DE API: /api/restaurantes
  Este archivo define el endpoint GET para obtener los restaurantes.
  Delega el trabajo al Controlador.
*/
export async function GET(request: Request) {
  return RestaurantController.handleGetRestaurants(request);
}

export async function POST(request: Request) {
  return RestaurantController.handleCreateRestaurant(request);
}
