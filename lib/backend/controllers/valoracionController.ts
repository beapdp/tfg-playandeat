import { NextResponse } from 'next/server';
import { ValoracionService } from '../services/valoracionService';
import { supabase, getSupabaseClient } from '@/lib/supabase';

/*
  CAPA DE CONTROLADOR (VALORACION CONTROLLER)
  Recibe las peticiones HTTP de la API, valida los datos y llama al servicio.
  No habla directamente con la base de datos: eso lo hace el servicio.
*/
export class ValoracionController {

  // Controlador para OBTENER valoraciones de un restaurante
  // Se llama cuando alguien hace: GET /api/valoraciones?restauranteId=xxx
  static async handleGetValoraciones(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const restauranteId = searchParams.get('restauranteId');

      // Validamos que venga el parámetro obligatorio
      if (!restauranteId) {
        return NextResponse.json(
          { error: 'El parámetro restauranteId es obligatorio.' },
          { status: 400 }
        );
      }

      const data = await ValoracionService.getValoracionesByRestaurante(restauranteId);
      return NextResponse.json(data);

    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Controlador para CREAR una nueva valoración
  // Se llama cuando alguien hace: POST /api/valoraciones
  static async handleCreateValoracion(req: Request) {
    try {
      const body = await req.json();
      const { restauranteId, puntuacion, comentario } = body;

      // Comprobamos que el usuario tiene sesión activa extrayendo el Bearer token
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      
      let user = null;
      let authenticatedClient = supabase;

      if (token) {
        authenticatedClient = getSupabaseClient(token);
        const { data: { user: authUser } } = await authenticatedClient.auth.getUser();
        user = authUser;
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;
      }

      if (!user) {
        return NextResponse.json(
          { error: 'Debes iniciar sesión para valorar un restaurante.' },
          { status: 401 } // 401 = No autorizado
        );
      }

      // Validamos que la puntuación sea un número entre 1 y 5
      if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
        return NextResponse.json(
          { error: 'La puntuación debe ser un número entre 1 y 5.' },
          { status: 400 } // 400 = Datos incorrectos
        );
      }

      if (!restauranteId) {
        return NextResponse.json(
          { error: 'El restauranteId es obligatorio.' },
          { status: 400 }
        );
      }

      // Llamamos al servicio para crear la valoración pasándole el cliente con la sesión autenticada (para RLS)
      const resultado = await ValoracionService.crearValoracion({
        perfilId:      user.id,
        restauranteId,
        puntuacion,
        comentario,
      }, authenticatedClient);

      return NextResponse.json({
        message:  'Valoración guardada con éxito.',
        nuevaMedia: resultado.nuevaMedia,
      });

    } catch (error: any) {
      // Si la clave UNIQUE falla, el usuario ya había valorado este restaurante
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya has valorado este restaurante anteriormente.' },
          { status: 409 } // 409 = Conflicto
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Controlador para ELIMINAR una valoración
  // Se llama cuando alguien hace: DELETE /api/valoraciones?id=xxx
  static async handleDeleteValoracion(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      // Validamos que venga el parámetro obligatorio
      if (!id) {
        return NextResponse.json(
          { error: 'El parámetro id es obligatorio.' },
          { status: 400 }
        );
      }

      // Comprobamos que el usuario tiene sesión activa extrayendo el Bearer token
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      
      let user = null;
      let authenticatedClient = supabase;

      if (token) {
        authenticatedClient = getSupabaseClient(token);
        const { data: { user: authUser } } = await authenticatedClient.auth.getUser();
        user = authUser;
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;
      }

      if (!user) {
        return NextResponse.json(
          { error: 'Debes iniciar sesión para realizar esta acción.' },
          { status: 401 } // 401 = No autorizado
        );
      }

      // Llamamos al servicio para eliminar la valoración, pasando la sesión del usuario (para RLS)
      const resultado = await ValoracionService.eliminarValoracion(id, user.id, authenticatedClient);

      return NextResponse.json({
        message: 'Valoración eliminada con éxito.',
        nuevaMedia: resultado.nuevaMedia,
      });

    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
