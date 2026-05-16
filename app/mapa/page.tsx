import Link from 'next/link';
import { MapPin, HardHat, ArrowLeft } from 'lucide-react';

export default function MapaPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-orange-50 p-6 rounded-full mb-6 relative">
        <MapPin size={64} className="text-primary" />
        <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-full">
          <HardHat size={24} />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-secondary mb-4">
        Mapa en Construcción
      </h1>
      
      <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
        ¡Vaya! Has llegado antes de tiempo. Estamos trabajando duro para integrar la geolocalización y los mapas interactivos en esta sección.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/" 
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
