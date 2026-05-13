import { NextResponse } from 'next/server';
import { AuthService } from '../services/authService';

export class AuthController {
  
  // Manejar Registro (crear perfil en BD con userId ya creado por el cliente)
  static async handleRegistro(req: Request) {
    try {
      const body = await req.json();
      
      // Si viene userId, solo creamos el perfil (el usuario ya existe en Auth)
      if (body.userId) {
        await AuthService.crearPerfil(body.userId, body.nombre, body.rol);
        return NextResponse.json({ message: 'Perfil creado con éxito' });
      }

      // Fallback: registro completo (por si se usa el endpoint directamente)
      const { email, password, nombre, rol } = body;
      if (!email || !password || !nombre || !rol) {
        return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
      }
      const data = await AuthService.registrar(email, password, nombre, rol);
      return NextResponse.json({ message: 'Usuario registrado con éxito', data });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Manejar Login
  static async handleLogin(req: Request) {
    try {
      const { email, password } = await req.json();
      const data = await AuthService.iniciarSesion(email, password);
      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
  }

  // Obtener Perfil (para login)
  static async handleGetPerfil(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId');
      if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });

      const data = await AuthService.obtenerPerfil(userId);
      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Manejar Perfil (Actualizar nombre)
  static async handleUpdatePerfil(req: Request) {
    try {
      const { userId, nombre } = await req.json();
      const data = await AuthService.actualizarPerfil(userId, nombre);
      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
