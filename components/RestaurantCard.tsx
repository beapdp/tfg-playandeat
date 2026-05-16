"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Shapes, Palette, Music, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface RestaurantData {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  services: string[];
}

interface Props {
  restaurant: RestaurantData;
}

export default function RestaurantCard({ restaurant }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  // Estado para saber si el que está viendo la tarjeta es un negocio
  const [userRole, setUserRole] = useState<string | null>(null);

  // Comprobamos si el restaurante ya es favorito cuando se carga la tarjeta
  useEffect(() => {
    const checkFavorite = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Guardamos el rol para saber si tenemos que ocultar el botón
      setUserRole(user.user_metadata?.rol || null);

      const { data } = await supabase
        .from('favoritos')
        .select('id')
        .eq('perfil_id', user.id)
        .eq('restaurante_id', restaurant.id)
        .single();
      
      if (data) setIsFavorite(true);
    };

    checkFavorite();
  }, [restaurant.id, supabase]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Si no hay usuario, mostramos el aviso visual y quitamos el alert aburrido
      setShowLoginNotice(true);
      setTimeout(() => setShowLoginNotice(false), 3000); // Se quita a los 3 segundos
      return;
    }

    setIsLoading(true);
    try {
      // Comprobamos si ya lo tiene en favoritos
      const { data: existing } = await supabase
        .from('favoritos')
        .select('id')
        .eq('perfil_id', user.id)
        .eq('restaurante_id', restaurant.id)
        .maybeSingle();

      if (existing) {
        // Si existe, lo borramos
        await supabase
          .from('favoritos')
          .delete()
          .eq('id', existing.id);
        setIsFavorite(false);
      } else {
        // Si no existe, lo insertamos
        await supabase
          .from('favoritos')
          .insert({
            perfil_id: user.id,
            restaurante_id: restaurant.id
          });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error al guardar favorito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        size={16} 
        className={index < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} 
      />
    ));
  };

  const renderServiceIcon = (service: string, index: number) => {
    const bgColors = ['bg-orange-100 text-orange-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600'];
    const colorClass = bgColors[index % bgColors.length];

    let Icon = Shapes;
    if (service === 'animacion') Icon = Palette;
    if (service === 'musica') Icon = Music;

    return (
      <div key={service} className={`p-1.5 rounded-md ${colorClass}`} title={service}>
        <Icon size={16} strokeWidth={2} />
      </div>
    );
  };

  return (
    <Link href={`/restaurantes/${restaurant.id}`} className="block h-full">
      <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full cursor-pointer group">
        
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden shrink-0">
          <Image 
            src={restaurant.imageUrl} 
            alt={restaurant.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* AVISO DE LOGIN (Tooltip) */}
          {showLoginNotice && (
            <div className="absolute top-12 right-3 z-20 bg-secondary text-white text-[10px] py-1 px-2 rounded-lg shadow-lg animate-bounce">
              ¡Inicia sesión para guardar!
            </div>
          )}

          {/* BOTÓN DE CORAZÓN (Oculto para Negocios porque no tienen panel de favoritos) */}
          {userRole !== 'negocio' && (
            <button 
              onClick={toggleFavorite}
              disabled={isLoading}
              className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-300 z-10 ${
                isFavorite 
                  ? "bg-red-50 text-red-500 scale-110" 
                  : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white"
              } ${showLoginNotice ? "animate-pulse ring-2 ring-red-400" : ""}`}
            >
              <Heart size={20} className={isFavorite ? "fill-current" : ""} />
            </button>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-extrabold text-secondary text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
          
          <div className="flex items-center gap-1 mb-4">
            {renderStars(restaurant.rating)}
          </div>

          <div className="flex-1"></div>

          <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
               {restaurant.services.map((service, idx) => renderServiceIcon(service, idx))}
            </div>

            <div className="w-8 h-8 rounded-full border border-blue-200 text-blue-400 flex items-center justify-center bg-blue-50">
               <span className="text-[10px] font-bold">P&E</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
