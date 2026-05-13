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

// Creamos y exportamos el cliente. 
// A partir de ahora, cuando queramos leer restaurantes haremos: supabase.from('restaurantes').select('*')
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
