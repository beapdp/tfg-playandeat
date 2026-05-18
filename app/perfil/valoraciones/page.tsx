'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Trash2, ArrowLeft, MessageSquare, AlertTriangle, ExternalLink } from 'lucide-react';

interface Review {
  id: string;
  puntuacion: number;
  comentario: string | null;
  created_at: string;
  restaurante_id: string;
  restaurantes: {
    name: string;
    image_url: string | null;
  } | null;
}

export default function MisValoracionesPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Cargar las valoraciones del usuario
  const cargarMisValoraciones = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);

      // Consulta relacional: sacamos las valoraciones con el nombre e imagen del restaurante
      const { data, error: queryError } = await supabase
        .from('valoraciones')
        .select(`
          id,
          puntuacion,
          comentario,
          created_at,
          restaurante_id,
          restaurantes ( name, image_url )
        `)
        .eq('perfil_id', session.user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setReviews(data || []);

    } catch (err: any) {
      console.error(err);
      setError('No se pudieron cargar tus valoraciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisValoraciones();
  }, []);

  // Manejar el borrado de una valoración
  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta valoración? Se recalculará la nota media del restaurante automáticamente.')) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      setSuccess('');

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Hacemos el fetch llamando a la API DELETE que hemos creado
      const res = await fetch(`/api/valoraciones?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Error al eliminar la valoración');
      }

      setSuccess('Valoración eliminada correctamente.');
      // Filtramos la valoración de la lista local
      setReviews(reviews.filter((r) => r.id !== id));

    } catch (err: any) {
      setError(err.message || 'No se pudo eliminar la valoración.');
    } finally {
      setDeletingId(null);
    }
  };

  // Renderizar las estrellitas
  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < count ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-gray-500 font-medium italic">Cargando tus valoraciones...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[70vh]">
      
      {/* Botón Volver */}
      <Link href="/perfil" className="inline-flex items-center gap-2 text-primary hover:text-orange-600 font-semibold mb-6 transition-colors text-sm">
        <ArrowLeft size={16} />
        Volver al Panel
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary flex items-center gap-2">
            <MessageSquare className="text-primary" />
            Mis Valoraciones
          </h1>
          <p className="text-gray-500 mt-1">Gestiona o elimina las opiniones que has dejado en los restaurantes familiares.</p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 bg-green-50 p-4 rounded-xl text-sm font-medium mb-6 border border-green-100">
          {success}
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
              
              <div className="flex-1">
                {/* Cabecera de la reseña */}
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-extrabold text-secondary text-lg hover:text-primary transition-colors">
                    <Link href={`/restaurantes/${review.restaurante_id}`} className="flex items-center gap-1.5">
                      {review.restaurantes?.name || 'Restaurante'}
                      <ExternalLink size={14} className="text-gray-400" />
                    </Link>
                  </h3>
                  {renderStars(review.puntuacion)}
                </div>

                <span className="text-xs text-gray-400 block mb-3">
                  Publicado el {new Date(review.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>

                {review.comentario && (
                  <p className="text-gray-600 text-sm italic leading-relaxed border-l-2 border-primary/20 pl-3">
                    "{review.comentario}"
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex md:flex-col justify-end items-end gap-3 min-w-[120px]">
                {/* Botón para ir al restaurante a editarla */}
                <Link 
                  href={`/restaurantes/${review.restaurante_id}`}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Modificar en el local
                </Link>

                {/* Botón de Borrar */}
                <button
                  onClick={() => handleEliminar(review.id)}
                  disabled={deletingId === review.id}
                  className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {deletingId === review.id ? 'Eliminando...' : 'Eliminar reseña'}
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold text-lg">Aún no has dejado ninguna opinión</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Tus reseñas ayudan a otras familias a encontrar el sitio ideal.</p>
          <Link href="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors inline-block text-sm shadow-sm">
            Buscar restaurantes familiares
          </Link>
        </div>
      )}

    </div>
  );
}
