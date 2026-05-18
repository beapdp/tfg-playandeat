import Image from 'next/image';
import Link from 'next/link';
import { Map } from 'lucide-react';

export default function MapPromo() {
  return (
    // Contenedor principal con margen arriba y abajo para separarlo del resto
    <section className="w-full max-w-6xl mx-auto my-16 md:my-24 px-4">
      
      {/* 
        Caja naranja (bg-primary) con esquinas redondeadas (rounded-3xl).
        En móviles es una columna (flex-col), en PC son dos columnas (md:flex-row)
      */}
      <div className="bg-primary rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-xl gap-8 relative overflow-hidden">
        
        {/* === TEXTO A LA IZQUIERDA === */}
        <div className="flex-1 text-white z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Explora en el Mapa
          </h2>
          <p className="text-white/90 text-sm md:text-base mb-8 max-w-md leading-relaxed">
            Descubre los mejores restaurantes con zonas de ocio infantil cerca de tu ubicación.
            Nuestro mapa interactivo te mostrará todas las opciones disponibles a tu alrededor para que planear el fin de semana sea pan comido.
          </p>
          
          {/* Botón blanco con texto oscuro */}
          <Link 
            href="/mapa"
            className="inline-flex items-center gap-2 bg-white text-secondary font-extrabold px-6 py-3 rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-md"
          >
            <Map size={20} />
            Ver Mapa Interactivo
          </Link>
        </div>

        {/* === IMAGEN DEL MAPA A LA DERECHA === */}
        <div className="flex-1 w-full relative z-10 flex justify-center md:justify-end">
          {/* 
            MEJORA DE UX (Experiencia de Usuario):
            Hemos envuelto la previsualización en un <Link> para que toda la imagen sea 
            un punto de acceso al mapa real. Esto se llama "Clickable Area Expansion" y 
            mejora la navegabilidad. 
            
            Además, hemos eliminado la etiqueta estática de "Previsualización" por un 
            indicador dinámico que solo aparece al pasar el ratón (hover), invitando a la acción.
          */}
          <Link href="/mapa" className="relative w-full max-w-md h-64 md:h-80 bg-orange-200 rounded-2xl shadow-lg border-4 border-white/20 overflow-hidden transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer group block">
            <Image 
              // Usamos una imagen genérica de mapa de Unsplash
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
              alt="Vista del Mapa Interactivo"
              fill
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* 
              OVERLAY INTERACTIVO:
              Este bloque aparece suavemente cuando el usuario pasa el ratón por encima 
              del mapa, indicando visualmente que es un elemento con el que se puede interactuar.
            */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <span className="bg-white text-primary px-6 py-3 rounded-full text-sm font-extrabold shadow-xl uppercase tracking-wider flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Map size={18} />
                  Abrir Mapa
               </span>
            </div>
          </Link>
        </div>

        {/* Círculos decorativos de fondo (para que la caja no sea totalmente plana) */}
        <div className="absolute top-0 right-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-3xl -mb-20 -mr-20 pointer-events-none"></div>

      </div>
    </section>
  );
}
