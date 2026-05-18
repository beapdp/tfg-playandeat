/* 
  CONFIGURACIÓN DEL CLIENTE DE SUPABASE
  Este archivo nos permitirá conectarnos a la base de datos desde cualquier parte de la app.
*/
import { createClient } from '@supabase/supabase-js';

// Cogemos las claves que habremos puesto en el archivo oculto .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Si falta alguna clave, avisamos en la consola para no volvernos locos buscando el error
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan las variables de entorno de Supabase. Revisa el archivo .env.local');
}

// Creamos y exportamos el cliente por defecto (anónimo)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para obtener un cliente de Supabase con el contexto de sesión de un usuario (para RLS)
export function getSupabaseClient(token?: string) {
  if (!token) return supabase;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
