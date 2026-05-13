import { AuthController } from '@/lib/backend/controllers/authController';

// GET /api/auth/perfil?userId=xxx → devuelve el perfil (usado en el login)
export async function GET(request: Request) {
  return AuthController.handleGetPerfil(request);
}

// PUT /api/auth/perfil → actualiza el nombre del perfil
export async function PUT(request: Request) {
  return AuthController.handleUpdatePerfil(request);
}
