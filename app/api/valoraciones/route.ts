import { ValoracionController } from '@/lib/backend/controllers/valoracionController';

/*
  RUTAS DE LA API - VALORACIONES
  Siguen el estándar de Next.js App Router (route.ts).
  Este archivo es un distribuidor de tráfico que delega en el Controlador.
*/

// GET /api/valoraciones
export async function GET(request: Request) {
  return ValoracionController.handleGetValoraciones(request);
}

// POST /api/valoraciones
export async function POST(request: Request) {
  return ValoracionController.handleCreateValoracion(request);
}

// DELETE /api/valoraciones
export async function DELETE(request: Request) {
  return ValoracionController.handleDeleteValoracion(request);
}
