'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Store } from 'lucide-react';

export default function RegistroPage() {
  // useRouter: Hook de Next.js que nos permite redirigir al usuario mediante código (ej: router.push('/home'))
  const router = useRouter();
  
  // Estados para el formulario
  const [rol, setRol] = useState<'familia' | 'negocio' | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 1. Añadimos un nuevo estado para guardar la confirmación de la contraseña
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para UX (experiencia de usuario)
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // handleRegistro: Función asíncrona que se ejecuta al enviar el formulario
  // React.FormEvent: Es un tipo de TypeScript que le dice al código que 'e' es un evento de formulario.
  // (Si en tu editor sale tachado, suele ser un fallo visual del editor con TypeScript, pero es correcto).
  const handleRegistro = async (e: React.FormEvent) => {
    // e.preventDefault(): Evita que el formulario recargue la página web por defecto, permitiéndonos procesarlo en segundo plano.
    e.preventDefault();
    if (!rol) {
      setError('Por favor, selecciona si eres una Familia o un Negocio.');
      return;
    }

    // 2. Validación frontend: Comprobamos si las dos contraseñas son idénticas antes de enviar nada
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, asegúrate de escribirlas igual.');
      return;
    }

    // 3. Validación de fortaleza de la contraseña
    // Explicación de la Regex (Expresión Regular):
    // ^                 : Inicio del texto
    // (?=.*[A-Z])       : Debe contener al menos una letra mayúscula
    // (?=.*[0-9])       : Debe contener al menos un número
    // .{8,}             : Debe tener al menos 8 caracteres de longitud
    // $                 : Fin del texto
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      // supabase.auth.signUp: Función oficial de la librería de Supabase para crear un usuario.
      // Se encarga automáticamente de encriptar la contraseña con bcrypt en su servidor.
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre, rol }
        }
      });

      // signUpError es simplemente el nombre que le hemos dado a la variable 'error' que devuelve Supabase para no confundirla con nuestro estado 'error' de React.
      if (signUpError) throw signUpError;

      // También creamos el perfil en nuestra tabla a través del backend
      if (data.user) {
        await fetch('/api/auth/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, nombre, rol })
        });
      }

      // data.user contiene la información del usuario recién creado.
      // data.session contiene el token JWT si la sesión se ha iniciado automáticamente.
      if (data.session) {
        if (rol === 'familia') {
          // window.location.href: Redirige forzando una recarga de la página completa, a diferencia de router.push() que lo hace sin recargar.
          window.location.href = '/perfil';
        } else {
          window.location.href = '/admin';
        }
      } else {
        // Sin sesión → ir a login para que el usuario entre manualmente
        // setError(''): Limpiamos cualquier error previo para que no se muestre.
        setError('');
        alert('¡Cuenta creada! Por favor inicia sesión con tus datos.');
        window.location.href = '/login';
      }
    } catch (err: any) {
      // Si cualquier cosa falla arriba (ej: email repetido), el código "salta" aquí.
      // err.message es el mensaje de error que devuelve Supabase o nuestra API.
      setError(err.message || 'Error en el registro. Inténtalo de nuevo.');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-3xl font-extrabold flex items-center justify-center gap-1">
          <span className="text-secondary">Play</span>
          <span className="text-primary">&</span>
          <span className="text-secondary">Eat</span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Crea tu cuenta
        </h2>
      </div>

      {/* div: Contenedor principal de Tailwind para centrar y dar fondo blanco y sombra al formulario */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {/* {error && ...}: Es un condicional de React. Significa "Si la variable error NO está vacía, dibuja este div rojo". */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegistro} className="space-y-6">
            
            {/* SELECCIÓN DE ROL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                ¿Qué tipo de cuenta quieres crear?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* onClick={() => setRol('familia')}: Al hacer clic, actualiza la variable 'rol' a 'familia'. */}
                <button
                  type="button"
                  onClick={() => setRol('familia')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    rol === 'familia' 
                      ? 'border-primary bg-orange-50 text-primary' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Users size={32} className="mb-2" />
                  <span className="font-bold">Familia</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRol('negocio')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    rol === 'negocio' 
                      ? 'border-secondary bg-blue-50 text-secondary' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {/* <Store /> es un icono importado de la librería lucide-react, representa una tienda/negocio */}
                  <Store size={32} className="mb-2" />
                  <span className="font-bold">Negocio</span>
                </button>
              </div>
            </div>

            {/* CAMPOS DEL FORMULARIO */}
            {rol && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {rol === 'familia' ? 'Nombre o Apellidos de la Familia' : 'Nombre del Restaurante'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* 3. Nuevo campo visual para confirmar la contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {cargando ? 'Registrando...' : 'Crear cuenta'}
                </button>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              {/* <Link>: Componente de Next.js para navegar sin recargar la página */}
              <Link href="/login" className="font-medium text-primary hover:text-orange-600">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
