import { AuthController } from '@/lib/backend/controllers/authController';

export async function POST(request: Request) {
  return AuthController.handleRegistro(request);
}
