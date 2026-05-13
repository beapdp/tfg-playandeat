import { RestaurantController } from '@/lib/backend/controllers/restaurantController';

/* 
  RUTA DE API: /api/restaurantes/[id]
  Este archivo define el endpoint GET para obtener un único restaurante por su ID.
*/
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return RestaurantController.handleGetRestaurantById(id);
}
