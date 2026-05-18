'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Shield, KeyRound, Lock, CheckCircle2 } from 'lucide-react';

export default function DatosPage() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(true);

  // Estados para el cambio de contraseña
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [mensajePassword, setMensajePassword] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    // 1. Cargar el nombre y el correo actual de la sesión activa
    const cargarDatos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setEmail(session.user.email || '');

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

  // 2. Función para cambiar la contraseña usando Supabase Auth API
  const handleActualizarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajePassword({ tipo: '', texto: '' });

    if (!password) {
      setMensajePassword({ tipo: 'error', texto: 'Por favor, introduce una nueva contraseña.' });
      return;
    }

    if (password !== confirmPassword) {
      setMensajePassword({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
      return;
    }

    if (password.length < 6) {
      setMensajePassword({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres por seguridad.' });
      return;
    }

    setGuardandoPassword(true);

    try {
      // Llamada directa al cliente SDK de Supabase para actualizar la contraseña del usuario activo
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMensajePassword({ tipo: 'exito', texto: '¡Contraseña actualizada correctamente!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMensajePassword({ tipo: 'error', texto: err.message || 'No se pudo cambiar la contraseña.' });
    } finally {
      setGuardandoPassword(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-500 font-medium italic">Cargando tus datos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[85vh]">
      <Link href="/perfil" className="text-primary font-semibold hover:underline mb-6 inline-block">
        &larr; Volver al Panel
      </Link>

      <h1 className="text-3xl md:text-4xl font-extrabold text-secondary mb-2">Mis Datos</h1>
      <p className="text-gray-500 mb-8">Administra la información de tu perfil y la seguridad de tu cuenta.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Lado izquierdo: Información y Badges */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-primary mb-4">
              <User size={40} />
            </div>
            <h3 className="font-extrabold text-secondary text-lg mb-1">{nombre || 'Usuario Familia'}</h3>
            <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 flex items-center gap-1.5 mt-2">
              <Shield size={12} /> Cuenta Familia Activa
            </span>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-secondary">
            <h4 className="font-extrabold text-sm mb-2 flex items-center gap-2 text-primary">
              <Shield size={16} /> Consejo de Seguridad
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Mantén tu contraseña segura y no la compartas con nadie. Te recomendamos utilizar una combinación de letras, números y caracteres especiales para proteger los datos de tu cuenta.
            </p>
          </div>
        </div>

        {/* Lado derecho: Información de Perfil y Formulario de Contraseña */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Bloque 1: Información del Perfil (Solo Lectura) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
              <User size={20} className="text-primary" /> Información del Perfil
            </h2>

            <div className="space-y-4">
              <div>
                <span className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nombre de la Familia
                </span>
                <div className="bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-secondary font-bold flex items-center justify-between text-sm">
                  <span>{nombre || 'Cargando...'}</span>
                  <Lock size={16} className="text-gray-400" title="Información protegida" />
                </div>
              </div>

              <div>
                <span className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </span>
                <div className="bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-secondary font-bold flex items-center justify-between text-sm">
                  <span>{email || 'Cargando...'}</span>
                  <Lock size={16} className="text-gray-400" title="Información protegida" />
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 italic mt-4">
              Para cambiar tu nombre o tu correo electrónico, ponte en contacto con el soporte técnico de Play & Eat.
            </p>
          </div>

          {/* Bloque 2: Cambiar Contraseña */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
              <KeyRound size={20} className="text-primary" /> Seguridad de la Cuenta
            </h2>

            {mensajePassword.texto && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                mensajePassword.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {mensajePassword.tipo === 'exito' && <CheckCircle2 size={16} />}
                {mensajePassword.texto}
              </div>
            )}

            <form onSubmit={handleActualizarPassword} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={guardandoPassword}
                className="w-full md:w-auto bg-secondary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg text-sm"
              >
                {guardandoPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
