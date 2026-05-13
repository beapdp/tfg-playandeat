'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeartOff, Search, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import RestaurantCard, { RestaurantData } from '@/components/RestaurantCard';

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<RestaurantData[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarFavoritos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = '/login';
          return;
        }

        // Hacemos un "join" para traernos los datos del restaurante a través de la tabla de favoritos
        const { data, error } = await supabase
          .from('favoritos')
          .select(`
            restaurante_id,
            restaurantes (
              id,
              name,
              imageUrl:image_url,
              rating,
              services
            )
          `)
          .eq('perfil_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Limpiamos los datos para que encajen con la tarjeta
        if (data) {
          const rests = data
            .filter((fav: any) => fav.restaurantes != null)
            .map((fav: any) => ({
              id: fav.restaurantes.id,
              name: fav.restaurantes.name,
              imageUrl: fav.restaurantes.imageUrl || '',
              rating: fav.restaurantes.rating || 0,
              services: fav.restaurantes.services || []
            }));
          setFavoritos(rests);
        }
      } catch (error) {
        console.error("Error cargando favoritos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarFavoritos();
  }, []);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-500 font-medium italic">Cargando tus lugares favoritos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-[70vh]">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/perfil" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-500">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-secondary">Tus Favoritos</h1>
          <p className="text-gray-500">Los restaurantes que más te han gustado para ir en familia.</p>
        </div>
      </div>

      {favoritos.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 px-4 text-center flex flex-col items-center justify-center mt-8">
          <div className="w-24 h-24 bg-red-50 text-red-300 rounded-full flex items-center justify-center mb-6">
            <HeartOff size={48} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-secondary mb-4">
            Aún no tienes favoritos
          </h2>
          <p className="text-gray-500 mb-10 text-lg max-w-lg">
            Cuando encuentres un restaurante que te encante, dale al botón de corazón para guardarlo aquí y tenerlo siempre a mano.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/" 
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Search size={20} />
              Explorar Restaurantes
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoritos.map((restaurante) => (
            <div key={restaurante.id} className="h-[360px]">
              <RestaurantCard restaurant={restaurante} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
