import { RestaurantService } from '@/lib/backend/services/restaurantService';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function RestauranteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // LLAMADA AL SERVICIO (BACKEND)
  let restaurante = null;
  try {
    restaurante = await RestaurantService.getRestaurantById(id);
  } catch (e) {
    notFound();
  }

  if (!restaurante) {
    notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <Link href="/" className="text-primary font-semibold hover:underline mb-6 inline-block">
        &larr; Volver
      </Link>

      {/* Tarjeta grande de detalle */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Imagen principal (Cabecera) */}
        <div className="relative w-full h-64 md:h-96 bg-gray-200">
          <Image 
            src={restaurante.image_url} 
            alt={restaurante.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Contenido (Información) */}
        <div className="p-8 md:p-12">
          
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-secondary">
              {restaurante.name}
            </h1>
            <div className="flex items-center bg-orange-50 text-primary px-3 py-1 rounded-full font-bold">
              <Star size={18} className="fill-primary mr-1" />
              {restaurante.rating}
            </div>
          </div>

          <div className="flex items-center text-gray-500 mb-8">
            <MapPin size={20} className="mr-2" />
            <span className="text-lg">{restaurante.location}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-secondary mb-3">Sobre nosotros</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {restaurante.description}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-secondary mb-4">Servicios para familias</h2>
            <div className="grid grid-cols-2 gap-4">
              {restaurante.services?.map((servicio: string) => (
                <div key={servicio} className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <CheckCircle2 className="text-green-500 mr-3" size={24} />
                  <span className="capitalize">{servicio.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
