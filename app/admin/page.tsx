'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Store, PlusCircle, BarChart3, Info, Heart, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [restaurantes, setRestaurantes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Estado real para las estadísticas dinámicas
  const [stats, setStats] = useState({ favoritos: 0, valoraciones: 0, media: 0 });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error sesión:", sessionError);
          setError("Error de conexión con la sesión.");
          setCargando(false);
          return;
        }

        if (!session) {
          // No hay sesión, redirigimos a login
          router.push('/login');
          return;
        }

        const rol = session.user.user_metadata?.rol;
        const nombre = session.user.user_metadata?.nombre;

        if (rol !== 'negocio') {
          // Redirigir si no es negocio
          router.push('/perfil');
          return;
        }

        setPerfil({ nombre, rol });

        // Cargar los restaurantes del dueño y calcular estadísticas en tiempo real
        try {
          const res = await fetch(`/api/restaurantes?ownerId=${session.user.id}`);
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setRestaurantes(list);

          if (list.length > 0) {
            const ids = list.map(r => r.id);

            // 1. Obtener total de favoritos acumulados de todos sus restaurantes
            const { count: favsCount } = await supabase
              .from('favoritos')
              .select('id', { count: 'exact', head: true })
              .in('restaurante_id', ids);

            // 2. Obtener total de valoraciones acumuladas de todos sus restaurantes
            const { count: reviewsCount } = await supabase
              .from('valoraciones')
              .select('id', { count: 'exact', head: true })
              .in('restaurante_id', ids);

            // 3. Obtener la nota media global de sus restaurantes
            const sumaRating = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
            const mediaRating = list.length > 0 ? parseFloat((sumaRating / list.length).toFixed(1)) : 0;

            setStats({
              favoritos: favsCount || 0,
              valoraciones: reviewsCount || 0,
              media: mediaRating
            });
          }
        } catch (err) {
          console.error("Error restaurantes o estadísticas:", err);
        }

        setCargando(false);
      } catch (err) {
        console.error('Error fatal:', err);
        setError("Error inesperado en el panel.");
        setCargando(false);
      }
    };

    cargarDatos();

    // Timeout de seguridad de 5 segundos
    const timer = setTimeout(() => {
      if (cargando) {
        setCargando(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  if (cargando) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      <p className="text-gray-500 font-medium italic">Cargando área de negocios...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
      <p className="text-red-500 font-bold">{error}</p>
      <button onClick={() => window.location.reload()} className="text-secondary underline">Reintentar</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 min-h-[70vh]">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary mb-2">Panel de Negocios</h1>
          <p className="text-gray-500 font-medium">Bienvenido al espacio de gestión de {perfil?.nombre || 'tu negocio'}.</p>
        </div>
        <Link
          href="/admin/nuevo-restaurante"
          className="bg-secondary text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition-all flex items-center gap-2 shadow-sm text-sm"
        >
          <PlusCircle size={20} />
          Dar de alta restaurante
        </Link>
      </div>

      {/* Grid Principal de 2 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

        {/* --- COLUMNA 1: LISTADO DE RESTAURANTES --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-gray-100 flex items-center gap-3">
            <Store className="text-secondary" />
            <h2 className="font-bold text-secondary text-lg">Mis Restaurantes</h2>
          </div>

          <div className="p-6">
            {restaurantes.length > 0 ? (
              <div className="space-y-4">
                {restaurantes.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0 border border-gray-200">
                        <img 
                          src={r.image_url || '/placeholder-restaurant.jpg'} 
                          alt={r.name} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-sm">{r.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span>{Number(r.rating) > 0 ? r.rating : 'Sin valoraciones'}</span>
                          <span className="text-gray-300">|</span>
                          <span>{r.location}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Link href={`/admin/editar-restaurante/${r.id}`} className="text-xs font-bold text-orange-500 hover:underline">
                        Editar datos
                      </Link>
                      <Link href={`/restaurantes/${r.id}`} className="text-xs font-bold text-primary hover:underline">
                        Ver ficha
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-sm mb-4">Aún no tienes ningún restaurante publicado en Play&Eat.</p>
                <Link href="/admin/nuevo-restaurante" className="text-primary font-bold hover:underline text-sm">
                  Crear mi primer anuncio &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* --- COLUMNA 2: ESTADÍSTICAS REALES --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-orange-50 p-4 border-b border-gray-100 flex items-center gap-3">
            <BarChart3 className="text-primary" />
            <h2 className="font-bold text-secondary text-lg">Estadísticas en Tiempo Real</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center">
            {restaurantes.length > 0 ? (
              <div className="space-y-6">
                
                {/* Rejilla de métricas */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Tarjeta Favoritos */}
                  <div className="bg-red-50/40 border border-red-100/50 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Favoritos</span>
                      <Heart size={20} className="fill-red-500 text-red-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-secondary">{stats.favoritos}</p>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">Veces guardado por familias</p>
                    </div>
                  </div>

                  {/* Tarjeta Valoraciones */}
                  <div className="bg-amber-50/40 border border-amber-100/50 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Opiniones</span>
                      <MessageSquare size={20} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-secondary">{stats.valoraciones}</p>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">Reseñas recibidas</p>
                    </div>
                  </div>

                  {/* Tarjeta Nota Media */}
                  <div className="bg-yellow-50/30 border border-yellow-100/50 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nota Media</span>
                      <Star size={20} className="fill-yellow-400 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-secondary">{stats.media > 0 ? stats.media : '-'}</p>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">Puntuación global</p>
                    </div>
                  </div>

                  {/* Tarjeta Locales */}
                  <div className="bg-blue-50/40 border border-blue-100/50 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Locales</span>
                      <Store size={20} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-secondary">{restaurantes.length}</p>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">Restaurantes activos</p>
                    </div>
                  </div>

                </div>

                {/* Comentario motivacional / informativo basado en datos */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 italic">
                  {stats.valoraciones > 0 ? (
                    stats.media >= 4.5 ? (
                      <p className="text-green-700 font-semibold flex items-center gap-1.5">
                        🎉 ¡Excelente rendimiento! Tus locales tienen una valoración sobresaliente. Las familias adoran tu servicio.
                      </p>
                    ) : (
                      <p className="text-blue-700 font-semibold flex items-center gap-1.5">
                        👍 ¡Buen trabajo! Sigue ofreciendo espacios seguros y divertidos para las familias de Play&Eat.
                      </p>
                    )
                  ) : (
                    <p className="text-gray-500 font-medium">
                      Aún no has recibido opiniones de las familias. ¡Anímalas a valorar tu local para ver aumentar estas métricas!
                    </p>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">
                Publica un restaurante para empezar a ver cuántas familias guardan tu perfil y dejan valoraciones.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Nota informativa sobre la UX para las cuentas de negocio */}
      <div className="mt-8 bg-blue-50/50 border border-blue-100/50 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="text-blue-500 mt-1 shrink-0">
          <Info size={24} />
        </div>
        <div>
          <h3 className="font-bold text-secondary mb-1">Nota sobre tu cuenta de negocio</h3>
          <p className="text-sm text-gray-600">
            Tu perfil actual está diseñado exclusivamente para la gestión de locales comerciales. 
            Si deseas interactuar con la plataforma como usuario (por ejemplo, guardar tus propios 
            restaurantes favoritos para visitarlos en familia), te invitamos a 
            <Link href="/registro" className="text-primary font-bold hover:underline mx-1">
              crear una cuenta de Familia
            </Link> 
            gratuita con otro correo electrónico.
          </p>
        </div>
      </div>
    </div>
  );
}
