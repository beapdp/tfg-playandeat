'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Store, PlusCircle, BarChart3, Info } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [restaurantes, setRestaurantes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // console.log("Cargando datos...");
    
    const cargarDatos = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // console.log("Sesión:", session?.user?.id);

        if (sessionError) {
          console.error("Error sesión:", sessionError);
          setError("Error de conexión con la sesión.");
          setCargando(false);
          return;
        }

        if (!session) {
          // No hay sesión
          router.push('/login');
          return;
        }

        const rol = session.user.user_metadata?.rol;
        const nombre = session.user.user_metadata?.nombre;
        // console.log("Metadata:", { nombre, rol });

        if (rol !== 'negocio') {
          // Redirigir si no es negocio
          router.push('/perfil');
          return;
        }

        setPerfil({ nombre, rol });

        // Cargar los restaurantes del dueño
        try {
          // console.log("Buscando restaurantes...");
          const res = await fetch(`/api/restaurantes?ownerId=${session.user.id}`);
          const data = await res.json();
          setRestaurantes(Array.isArray(data) ? data : []);
          // Ok
        } catch (err) {
          console.error("Error restaurantes:", err);
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
        // console.warn("Timeout");
        setCargando(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const [error, setError] = useState('');

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary mb-2">Panel de Negocios</h1>
          <p className="text-gray-500">Bienvenido al espacio de gestión de {perfil?.nombre || 'tu negocio'}.</p>
        </div>
        <Link
          href="/admin/nuevo-restaurante"
          className="mt-4 md:mt-0 bg-secondary text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm"
        >
          <PlusCircle size={20} />
          Dar de alta restaurante
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

        {/* Mis Restaurantes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-gray-100 flex items-center gap-3">
            <Store className="text-secondary" />
            <h2 className="font-bold text-secondary text-lg">Mis Restaurantes</h2>
          </div>

          <div className="p-6">
            {restaurantes.length > 0 ? (
              <div className="space-y-4">
                {restaurantes.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                        <img src={r.image_url} alt={r.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
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
              <div className="py-10 text-center">
                <p className="text-gray-500 mb-4">Aún no tienes ningún restaurante publicado en Play&Eat.</p>
                <Link href="/admin/nuevo-restaurante" className="text-primary font-bold hover:underline">
                  Crear mi primer anuncio &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas (Maqueta) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-orange-50 p-4 border-b border-gray-100 flex items-center gap-3">
            <BarChart3 className="text-primary" />
            <h2 className="font-bold text-secondary text-lg">Estadísticas</h2>
          </div>
          <div className="p-10 text-center opacity-50">
            <p className="text-gray-500">
              {restaurantes.length > 0
                ? "Las estadísticas de tus restaurantes aparecerán aquí pronto."
                : "Publica un restaurante para empezar a ver cuántas familias visitan tu perfil."}
            </p>
          </div>
        </div>

      </div>

      {/* Nota informativa sobre la UX para las cuentas de negocio */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
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
