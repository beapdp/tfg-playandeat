/* INDICACIÓN DE CLIENT COMPONENT:
  En Next.js (App Router), por defecto los componentes son de servidor.
  Como este Header necesita interactividad (clics en el menú móvil), usamos "use client".
*/
"use client"; 

import { useState, useEffect } from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogOut, User } from 'lucide-react'; 
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  // Estado para guardar la sesión del usuario actual
  const [user, setUser] = useState<any>(null);
  const [rol, setRol] = useState<string | null>(null);
  // Nuevo estado para guardar el nombre del usuario y poder pintarlo en la web
  const [nombre, setNombre] = useState<string | null>(null);

  // useEffect se ejecuta al cargar el componente
  useEffect(() => {
    const syncUser = (session: any) => {
      if (session?.user) {
        setUser(session.user);
        
        // Supabase guarda información extra dentro del token JWT en el objeto user_metadata
        // De aquí podemos extraer el rol y el nombre que guardamos en el momento del registro sin tener que hacer una consulta lenta a la base de datos
        const rolMetadata = session.user.user_metadata?.rol;
        const nombreMetadata = session.user.user_metadata?.nombre;
        
        setRol(rolMetadata || null);
        setNombre(nombreMetadata || null);
      } else {
        setUser(null);
        setRol(null);
        setNombre(null);
      }
    };

    // 1. Check inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session);
    });

    // 2. Suscripción reactiva
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Función para cerrar sesión de forma segura y completa
  const handleLogout = async () => {
    try {
      // Cerrando sesión
      
      // No esperamos al await para que la UI responda al instante
      supabase.auth.signOut();
      
      // Limpiamos todo al momento
      setUser(null);
      setRol(null);
      setNombre(null);
      setIsOpen(false);

      // Redirigimos forzando recarga para limpiar memoria
      // Redirigir
      window.location.href = '/'; 
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-light px-4 md:px-8 py-4 shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center max-w-6xl">
        
        {/* === LOGO Y NOMBRE DE LA MARCA === */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="group-hover:scale-105 transition-transform">
            <Image 
              src="/logoPLato.png" 
              alt="Logo Play&Eat" 
              width={45} 
              height={45} 
              className="object-contain"
              unoptimized={true}
            />
          </div>
          <h1 className="text-2xl font-extrabold flex items-center">
            <span className="text-secondary">Play</span>
            <span className="text-primary mx-0.5">&</span>
            <span className="text-secondary">Eat</span>
          </h1>
        </Link>

        {/* === NAVEGACIÓN PARA ESCRITORIO (PC) === */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            // Si el usuario ESTÁ LOGUEADO
            <div className="flex items-center gap-4">
              <Link 
                href={rol === 'negocio' ? '/admin' : '/perfil'} 
                className="flex items-center gap-2 text-secondary font-semibold hover:text-primary transition-colors text-sm"
              >
                <User size={18} />
                {/* Mostramos el nombre dinámicamente. Si por algún error no hay nombre, mostramos 'Usuario' por defecto */}
                Hola, {nombre || 'Usuario'}
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          ) : (
            // Si el usuario NO ESTÁ LOGUEADO
            <>
              <Link href="/login" className="text-secondary font-semibold hover:text-primary transition-colors text-sm">
                Iniciar Sesión
              </Link>
              <Link 
                href="/registro" 
                className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-orange-600 transition-all shadow-sm text-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>

        {/* === BOTÓN DEL MENÚ MÓVIL ===
            - md:hidden: Solo se ve en móviles.
            - Al hacer clic, cambiamos isOpen al valor contrario (!isOpen).
        */}
        <button 
          className="md:hidden p-2 text-secondary focus:outline-none"
          onClick={() => setIsOpen(!isOpen)} 
          aria-label="Alternar menú"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* === MENÚ DESPLEGABLE MÓVIL === */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 p-4 flex flex-col gap-3 shadow-lg animate-in slide-in-from-top-2">
          {user ? (
            <>
              <div className="p-3 bg-gray-50 rounded-xl mb-2">
                <p className="text-xs text-gray-500">Conectado como:</p>
                {/* En la versión móvil también mostramos el nombre del usuario o su email si falta el nombre */}
                <p className="text-sm font-bold text-secondary truncate">{nombre || user.email}</p>
              </div>
              <Link 
                href={rol === 'negocio' ? '/admin' : '/perfil'} 
                className="flex items-center justify-center gap-2 text-secondary font-bold py-3 border border-gray-100 rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} />
                Ir a mi Panel
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold transition-all"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-secondary font-semibold py-2 text-center"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/registro" 
                className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-center shadow-sm"
                onClick={() => setIsOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}