'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Settings, User } from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // console.log("Cargando perfil...");
    
    const cargarPerfil = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // console.log("Sesión:", session?.user?.id);

        if (sessionError) {
          console.error("Error sesión:", sessionError);
          setError("Error al conectar con la sesión.");
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
        // console.log("Datos:", { nombre, rol });

        if (rol === 'negocio') {
          // Redirigir si es negocio
          router.push('/admin');
          return;
        }

        setPerfil({ nombre, rol });
        setCargando(false);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError("Ocurrió un fallo inesperado.");
        setCargando(false);
      }
    };

    cargarPerfil();
    
    // Timeout de seguridad: si en 5 segundos no ha cargado, soltamos el bloqueo
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-gray-500 font-medium italic">Cargando tu perfil...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <p className="text-red-500 font-bold">{error}</p>
      <button onClick={() => window.location.reload()} className="text-primary underline">Reintentar</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[70vh]">
      <h1 className="text-3xl font-extrabold text-secondary mb-2">Panel de Familia</h1>
      <p className="text-gray-500 mb-8">¡Hola, {perfil?.nombre || 'Familia'}! Gestiona tus sitios favoritos aquí.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta de Favoritos */}
        <Link href="/favoritos" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer group block">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Heart size={32} className="fill-red-500" />
          </div>
          <h3 className="font-bold text-lg text-secondary">Mis Favoritos</h3>
          <p className="text-sm text-gray-500 mt-2">Guarda tus restaurantes preferidos para tenerlos a mano.</p>
        </Link>

        {/* Tarjeta de Perfil */}
        <Link href="/perfil/datos" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer group block">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <User size={32} />
          </div>
          <h3 className="font-bold text-lg text-secondary">Mis Datos</h3>
          <p className="text-sm text-gray-500 mt-2">Edita tu nombre y preferencias de cuenta.</p>
        </Link>

        {/* Tarjeta de Ajustes */}
        <Link href="/perfil/ajustes" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer group block">
          <div className="w-16 h-16 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Settings size={32} />
          </div>
          <h3 className="font-bold text-lg text-secondary">Ajustes</h3>
          <p className="text-sm text-gray-500 mt-2">Configura notificaciones e idioma.</p>
        </Link>

      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors inline-block">
          Explorar Restaurantes
        </Link>
      </div>
    </div>
  );
}
