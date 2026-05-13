import { supabase } from '@/lib/supabase';

export class AuthService {
  
  // Obtener perfil por ID de usuario
  static async obtenerPerfil(userId: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Lógica de Registro
  static async registrar(email: string, pass: string, nombre: string, rol: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { nombre, rol }
      }
    });

    if (error) throw error;
    return data;
  }

  // Crear perfil en la tabla (separado del registro Auth)
  static async crearPerfil(userId: string, nombre: string, rol: string) {
    const { error } = await supabase
      .from('perfiles')
      .upsert([{ id: userId, nombre, rol }]);
    if (error) console.warn('Perfil ya existe o error menor:', error.message);
  }

  // Lógica de Login
  static async iniciarSesion(email: string, pass: string) {
    console.log("Iniciando login para:", email);
    
    // 1. Intentar login en Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      console.error("Error en Auth:", error.message);
      throw error;
    }
    
    console.log("Auth correcto, buscando perfil...");

    // 2. Obtener el perfil (Con tiempo límite o catch suave)
    let perfil = null;
    try {
      // Intentamos buscar el perfil, pero si no está (ej: trigger lento), no bloqueamos
      const { data: p, error: pError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', data.user?.id)
        .maybeSingle(); // maybeSingle es mejor que single() porque no lanza error si no hay nada
      
      perfil = p;
    } catch (e) {
      console.warn("Fallo al buscar perfil:", e);
    }

    console.log("Login completado");
    return { user: data.user, session: data.session, perfil };
  }

  // Lógica de Perfil (Actualizar nombre)
  static async actualizarPerfil(userId: string, nombre: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ nombre })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
