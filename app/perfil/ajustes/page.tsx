import Link from 'next/link';
import { Bell, Moon, Globe, Shield } from 'lucide-react';

export default function AjustesPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 min-h-[70vh]">
      <Link href="/perfil" className="text-primary font-semibold hover:underline mb-6 inline-block">
        &larr; Volver al Panel
      </Link>

      <h1 className="text-3xl font-extrabold text-secondary mb-2">Ajustes</h1>
      <p className="text-gray-500 mb-8">Personaliza tu experiencia en Play&Eat.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        
        {/* Notificaciones */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-full text-primary">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="font-bold text-secondary">Notificaciones por Email</h3>
              <p className="text-sm text-gray-500">Recibe avisos de nuevos restaurantes.</p>
            </div>
          </div>
          {/* Toggle visual (Maqueta) */}
          <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer opacity-50">
            <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-0.5 shadow-sm"></div>
          </div>
        </div>

        {/* Idioma */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-full text-blue-500">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-bold text-secondary">Idioma</h3>
              <p className="text-sm text-gray-500">Selecciona tu idioma preferido.</p>
            </div>
          </div>
          <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 focus:outline-none">
            <option>Español</option>
            <option>English</option>
          </select>
        </div>

        {/* Privacidad */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-full text-green-600">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-secondary">Privacidad</h3>
              <p className="text-sm text-gray-500">Ajustes de cookies y seguimiento.</p>
            </div>
          </div>
          <button className="text-sm font-bold text-gray-400 hover:text-gray-600">
            Configurar &rarr;
          </button>
        </div>

      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        Esta sección de ajustes es demostrativa para el Trabajo de Fin de Grado.
      </div>
    </div>
  );
}
