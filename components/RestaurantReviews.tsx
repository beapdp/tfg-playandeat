'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, MessageSquare, Send, AlertTriangle } from 'lucide-react';

interface Review {
  id: string;
  puntuacion: number;
  comentario: string | null;
  created_at: string;
  perfil_id: string;
  perfiles: {
    nombre: string | null;
  } | null;
}

export default function RestaurantReviews({ restauranteId }: { restauranteId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario de nueva valoración
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasExistingReview, setHasExistingReview] = useState(false);

  // Sesión del usuario
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Cargar valoraciones del backend
  const cargarValoraciones = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/valoraciones?restauranteId=${restauranteId}`);
      if (!res.ok) throw new Error('Error al cargar valoraciones');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar sesión del usuario al montar el componente
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setUserRole(session.user.user_metadata?.rol || 'familia');
      }
    };

    checkUser();
    cargarValoraciones();
  }, [restauranteId]);

  // Rellenar formulario automáticamente si el usuario ya tiene una opinión publicada
  useEffect(() => {
    if (user && reviews.length > 0) {
      const userReview = reviews.find((r) => r.perfil_id === user.id);
      if (userReview) {
        setRating(userReview.puntuacion);
        setComment(userReview.comentario || '');
        setHasExistingReview(true);
      } else {
        setHasExistingReview(false);
      }
    }
  }, [user, reviews]);

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!user) {
      setErrorMessage('Debes iniciar sesión para valorar.');
      return;
    }

    if (userRole !== 'familia') {
      setErrorMessage('Solo los perfiles de Familia pueden dejar valoraciones.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Obtenemos la sesión del cliente de Supabase para coger el access_token (JWT)
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/valoraciones', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          restauranteId,
          puntuacion: rating,
          comentario: comment.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar la valoración');
      }

      setSuccessMessage(hasExistingReview ? '¡Tu valoración se ha actualizado con éxito!' : '¡Muchas gracias por tu valoración!');
      
      // Recargamos las valoraciones
      await cargarValoraciones();

      // Recargamos la página entera tras 1.5s para actualizar la media del restaurante
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo guardar la valoración.');
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizar estrellitas dinámicas
  const renderStars = (count: number, isInteractive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const active = isInteractive 
        ? (hoverRating !== null ? i <= hoverRating : i <= rating)
        : i <= count;
      
      stars.push(
        <Star
          key={i}
          size={isInteractive ? 28 : 16}
          className={`${
            active ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-300'
          } ${isInteractive ? 'cursor-pointer transition-colors hover:scale-110' : ''}`}
          onClick={isInteractive ? () => setRating(i) : undefined}
          onMouseEnter={isInteractive ? () => setHoverRating(i) : undefined}
          onMouseLeave={isInteractive ? () => setHoverRating(null) : undefined}
        />
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
        <MessageSquare className="text-primary" />
        Opiniones de las familias
      </h2>

      {/* --- SECCIÓN 1: FORMULARIO DE VALORACIÓN --- */}
      {user ? (
        userRole === 'familia' ? (
          <form onSubmit={handleSubmit} className="bg-orange-50/50 border border-orange-100/50 p-6 rounded-2xl mb-8">
            <h3 className="font-bold text-secondary text-lg mb-2">
              {hasExistingReview ? 'Modificar tu experiencia' : 'Cuéntanos tu experiencia'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {hasExistingReview 
                ? 'Edita tu opinión y tu puntuación anterior' 
                : '¿Qué tal estuvo la zona de juego, el menú infantil y la atención familiar?'}
            </p>

            {/* Estrellas interactivas */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Tu puntuación:</span>
              {renderStars(rating, true)}
            </div>

            {/* Comentario escrito */}
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu comentario aquí (ej: 'El rincón de juegos es súper seguro y las monitoras encantadoras. Menú infantil muy rico y sano...')"
                className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 text-sm resize-y"
                required
              />
            </div>

            {/* Mensajes de error/éxito */}
            {errorMessage && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-medium mb-4 border border-red-100">
                <AlertTriangle size={16} />
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="text-green-600 bg-green-50 p-3 rounded-xl text-sm font-medium mb-4 border border-green-100">
                {successMessage}
              </div>
            )}

            {/* Botón de envío dinámico */}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm text-sm"
            >
              <Send size={16} />
              {submitting ? 'Guardando...' : (hasExistingReview ? 'Actualizar valoración' : 'Publicar valoración')}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm text-gray-500 mb-8 italic text-center">
            Solo las cuentas de tipo Familia pueden publicar valoraciones de locales.
          </div>
        )
      ) : (
        <div className="bg-orange-50/30 border border-orange-100 p-4 rounded-xl text-sm text-gray-700 mb-8 text-center">
          ¿Has estado en este local? <a href="/login" className="text-primary font-bold hover:underline">Inicia sesión como Familia</a> para dejar tu valoración y estrellas.
        </div>
      )}

      {/* --- SECCIÓN 2: LISTADO DE VALORACIONES --- */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-secondary text-sm">
                    {review.perfiles?.nombre || 'Familia de Play & Eat'}
                    {review.perfil_id === user?.id && (
                      <span className="ml-2 inline-block bg-primary/10 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Tu opinión
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                {renderStars(review.puntuacion)}
              </div>
              {review.comentario && (
                <p className="text-gray-600 text-sm leading-relaxed mt-2 italic">
                  "{review.comentario}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">Aún no hay opiniones de este restaurante.</p>
          <p className="text-gray-400 text-xs mt-1">¡Sé el primero en contarnos qué tal fue la experiencia familiar!</p>
        </div>
      )}
    </div>
  );
}
