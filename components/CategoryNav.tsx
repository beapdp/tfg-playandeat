import { Coffee, UtensilsCrossed, Wine, Croissant } from 'lucide-react';
// Importamos Link para poder navegar a otras páginas
import Link from 'next/link';

/* 
  Definimos los datos de las categorías en un array.
  De esta forma, en vez de copiar y pegar el mismo código 4 veces,
  usamos un .map() para generar cada botón. Esto es una buena práctica en React.
*/
const CATEGORIES = [
  { id: 'cafe', label: 'Café & Merienda', icon: Coffee },
  { id: 'comida', label: 'Comida & Cena', icon: UtensilsCrossed },
  { id: 'aperitivo', label: 'Aperitivo', icon: Wine },
  { id: 'brunch', label: 'Brunch', icon: Croissant },
];

export default function CategoryNav() {
  return (
    // Contenedor principal centrado con padding superior e inferior
    <section className="w-full max-w-4xl mx-auto mt-12 px-4">
      {/* 
        Grid: 2 columnas en móviles (grid-cols-2), 4 columnas en pc (md:grid-cols-4).
        Esto lo hace perfectamente responsive.
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 justify-items-center">
        
        {/* Recorremos el array de categorías para pintar cada botón */}
        {CATEGORIES.map((cat) => {
          // Guardamos el componente del icono en una variable en mayúscula para usarlo como etiqueta HTML
          const Icon = cat.icon;
          
          return (
            <Link 
              key={cat.id}
              // Al hacer clic, nos llevará a la página de búsqueda filtrando por esta categoría
              href={`/buscar?categoria=${cat.id}`}
              className="flex flex-col items-center gap-3 group focus:outline-none w-full cursor-pointer"
            >
              {/* Círculo del icono. Usamos hover y transición para darle vida */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#fdf2e9] text-[#d97746] flex items-center justify-center border-2 border-transparent group-hover:border-[#d97746] group-hover:bg-white transition-all shadow-sm">
                <Icon size={40} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
              </div>
              
              {/* Texto debajo del icono */}
              <span className="font-bold text-secondary text-sm md:text-base text-center group-hover:text-primary transition-colors">
                {cat.label}
              </span>
            </Link>
          );
        })}
        
      </div>
    </section>
  );
}
