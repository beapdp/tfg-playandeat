import { supabase } from '@/lib/supabase';

export class FavoriteService {
  static async toggleFavorite(userId: string, restaurantId: string) {
    // Comprobar si ya es favorito
    const { data: existing } = await supabase
      .from('favoritos')
      .select('id')
      .eq('perfil_id', userId)
      .eq('restaurante_id', restaurantId)
      .maybeSingle();

    if (existing) {
      // Si existe, lo quitamos
      await supabase
        .from('favoritos')
        .delete()
        .eq('id', existing.id);
      return { isFavorite: false };
    } else {
      // Si no existe, lo añadimos
      await supabase
        .from('favoritos')
        .insert({
          perfil_id: userId,
          restaurante_id: restaurantId
        });
      return { isFavorite: true };
    }
  }

  static async isFavorite(userId: string, restaurantId: string) {
    const { data } = await supabase
      .from('favoritos')
      .select('id')
      .eq('perfil_id', userId)
      .eq('restaurante_id', restaurantId)
      .maybeSingle();
    
    return !!data;
  }
}
