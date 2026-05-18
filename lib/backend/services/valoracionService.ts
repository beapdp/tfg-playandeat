import { supabase } from '@/lib/supabase';

/*
  CAPA DE SERVICIO (VALORACION SERVICE)
  Es la única parte de la app que habla directamente con la tabla 'valoraciones' de Supabase.
  Siguiendo el patrón Controller-Service, aquí solo hay lógica de datos, no de HTTP.
*/
export class ValoracionService {

  // Obtener todas las valoraciones de un restaurante concreto
  // Hacemos un JOIN con la tabla 'perfiles' para poder mostrar el nombre del autor
  static async getValoracionesByRestaurante(restauranteId: string, supabaseClient = supabase) {
    const { data, error } = await supabaseClient
      .from('valoraciones')
      .select(`
        id,
        puntuacion,
        comentario,
        created_at,
        perfil_id,
        perfiles ( nombre )
      `)
      .eq('restaurante_id', restauranteId)
      .order('created_at', { ascending: false }); // Las más recientes primero

    if (error) throw error;
    return data || [];
  }

  // Comprobar si un usuario ya ha valorado un restaurante concreto
  // Usamos la restricción UNIQUE de la BBDD: un usuario = una valoración por restaurante
  static async yaValorado(perfilId: string, restauranteId: string, supabaseClient = supabase): Promise<boolean> {
    const { data } = await supabaseClient
      .from('valoraciones')
      .select('id')
      .eq('perfil_id', perfilId)
      .eq('restaurante_id', restauranteId)
      .single();

    return !!data; // Si hay datos, devuelve true (ya valorado). Si no, false.
  }

  // Crear o actualizar una valoración y recalcular el rating medio del restaurante
  static async crearValoracion(data: {
    perfilId: string;
    restauranteId: string;
    puntuacion: number;
    comentario?: string;
  }, supabaseClient = supabase) {
    
    // Comprobamos si ya existe una valoración para este usuario y restaurante
    const { data: existente, error: checkError } = await supabaseClient
      .from('valoraciones')
      .select('id')
      .eq('perfil_id', data.perfilId)
      .eq('restaurante_id', data.restauranteId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existente) {
      // Si ya existe, actualizamos la puntuación y el comentario (respetando RLS de UPDATE)
      const { error: updateError } = await supabaseClient
        .from('valoraciones')
        .update({
          puntuacion: data.puntuacion,
          comentario: data.comentario || null,
        })
        .eq('id', existente.id)
        .eq('perfil_id', data.perfilId);

      if (updateError) throw updateError;
    } else {
      // Si no existe, insertamos la nueva valoración (respetando RLS de INSERT)
      const { error: insertError } = await supabaseClient
        .from('valoraciones')
        .insert([{
          perfil_id:       data.perfilId,
          restaurante_id:  data.restauranteId,
          puntuacion:      data.puntuacion,
          comentario:      data.comentario || null,
        }]);

      if (insertError) throw insertError;
    }

    // PASO 2: Calculamos la nueva media de estrellas de ese restaurante
    // Pedimos todas las puntuaciones para calcular el promedio (se puede hacer con el cliente por defecto)
    const { data: todasLasValoraciones, error: fetchError } = await supabase
      .from('valoraciones')
      .select('puntuacion')
      .eq('restaurante_id', data.restauranteId);

    if (fetchError) throw fetchError;

    // Hacemos el cálculo de la media
    const total = todasLasValoraciones?.length || 0;
    const suma  = todasLasValoraciones?.reduce((acc, v) => acc + v.puntuacion, 0) || 0;
    const media = total > 0 ? parseFloat((suma / total).toFixed(1)) : 0;

    // PASO 3: Actualizamos el campo 'rating' del restaurante con la nueva media
    // Restaurantes tiene RLS desactivado, por lo que podemos usar el cliente por defecto
    const { error: updateError } = await supabase
      .from('restaurantes')
      .update({ rating: media })
      .eq('id', data.restauranteId);

    if (updateError) throw updateError;

    return { success: true, nuevaMedia: media };
  }

  // Eliminar una valoración y actualizar el rating medio del restaurante
  static async eliminarValoracion(id: string, perfilId: string, supabaseClient = supabase) {
    // Primero, necesitamos obtener el restaurante_id antes de borrarla, para recalcular la media
    const { data: valoracion, error: selectError } = await supabaseClient
      .from('valoraciones')
      .select('restaurante_id')
      .eq('id', id)
      .eq('perfil_id', perfilId)
      .single();

    if (selectError) {
      throw new Error('No se encontró la valoración o no tienes permisos para borrarla.');
    }

    const restauranteId = valoracion.restaurante_id;

    // Eliminamos la valoración usando el cliente firmado (para RLS)
    const { error: deleteError } = await supabaseClient
      .from('valoraciones')
      .delete()
      .eq('id', id)
      .eq('perfil_id', perfilId);

    if (deleteError) throw deleteError;

    // Calculamos la nueva media de estrellas de ese restaurante (sin la valoración eliminada)
    const { data: todasLasValoraciones, error: fetchError } = await supabase
      .from('valoraciones')
      .select('puntuacion')
      .eq('restaurante_id', restauranteId);

    if (fetchError) throw fetchError;

    // Hacemos el cálculo de la media
    const total = todasLasValoraciones?.length || 0;
    const suma  = todasLasValoraciones?.reduce((acc, v) => acc + v.puntuacion, 0) || 0;
    const media = total > 0 ? parseFloat((suma / total).toFixed(1)) : 0;

    // Actualizamos el campo 'rating' del restaurante con la nueva media
    const { error: updateError } = await supabase
      .from('restaurantes')
      .update({ rating: media })
      .eq('id', restauranteId);

    if (updateError) throw updateError;

    return { success: true, nuevaMedia: media };
  }
}
