import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FavoriteService } from '@/lib/backend/services/favoriteService';

export async function POST(request: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { restaurantId } = await request.json();
    const result = await FavoriteService.toggleFavorite(user.id, restaurantId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar favoritos' }, { status: 500 });
  }
}
