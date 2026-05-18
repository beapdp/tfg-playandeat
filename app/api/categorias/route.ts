import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/*
  API ROUTE: GET /api/categorias
  Obtiene la lista completa de categorías desde la base de datos de Supabase.
  Esto hace que el sistema sea 100% dinámico: si se añade una categoría en BBDD,
  aparecerá de inmediato en los formularios de la aplicación web sin cambiar código.
*/
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, slug')
      .order('nombre', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("Error en API categorias:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
