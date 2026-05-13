'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DatosPage() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Cargar el nombre actual al entrar
    const cargarDatos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('perfiles')
        .select('nombre')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setNombre(data.nombre || '');
      }
      setCargando(false);
    };

    cargarDatos();
  }, [router]);

  // 2. Función para guardar los cambios a través de nuestra API
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const response = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, nombre })
      });

      if (!response.ok) throw new Error('Error al actualizar');

      setMensaje({ tipo: 'exito', texto: '¡Datos actualizados correctamente!' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'No se pudo actualizar el perfil.' });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-10 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 min-h-[70vh]">
      <Link href="/perfil" className="text-primary font-semibold hover:underline mb-6 inline-block">
        &larr; Volver al Panel
      </Link>

      <h1 className="text-3xl font-extrabold text-secondary mb-2">Mis Datos</h1>
      <p className="text-gray-500 mb-8">Actualiza la información de tu cuenta.</p>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${
            mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Familia
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej: Familia López García"
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
