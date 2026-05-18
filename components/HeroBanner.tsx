'use client';

// Componente interactivo (formulario) así que necesitamos 'use client'
import { useState } from 'react';
// Importamos useRouter para navegar por código cuando se envíe el formulario
import { useRouter } from 'next/navigation';
import { Search, MapPin, Utensils, Gamepad2 } from 'lucide-react';

export default function HeroBanner() {
  const router = useRouter(); // Hook para poder redirigir

  // Estados para guardar lo que escribe el usuario en el buscador
  const [ubicacion, setUbicacion] = useState('');
  const [tipoComida, setTipoComida] = useState('');
  const [entretenimiento, setEntretenimiento] = useState('');

  // Función que se ejecuta al pulsar el botón Buscar
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que recargue la página entera al enviar
    
    // Construimos la URL con los parámetros que ha elegido el usuario
    const queryParams = new URLSearchParams();
    if (ubicacion) queryParams.append('ubicacion', ubicacion);
    if (tipoComida) queryParams.append('comida', tipoComida);
    if (entretenimiento) queryParams.append('entretenimiento', entretenimiento);

    // Redirigimos a la página de resultados (ej: /buscar?ubicacion=Madrid&comida=italiana)
    router.push(`/buscar?${queryParams.toString()}`);
  };

  return (
    // section: Define la sección principal hero
    // bg-secondary es el azul marino, text-white para la letra, rounded-2xl para bordes redondeados
    <section className="w-full max-w-6xl mx-auto mt-6 md:mt-10 px-4">
      <div className="bg-secondary text-white rounded-3xl p-8 md:p-12 lg:p-16 text-center shadow-lg relative overflow-hidden">
        
        {/* Un pequeño efecto de diseño de fondo (opcional para darle un toque premium) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none"></div>

        {/* === TÍTULO PRINCIPAL === */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 md:mb-12 leading-tight relative z-10">
          Disfruta de la Sobremesa Mientras Ellos Juegan.<br className="hidden md:block"/>
          Encuentra Restaurantes <span className="text-primary">Play&Eat</span> Cerca de Ti.
        </h2>

        {/* === FORMULARIO DE BÚSQUEDA === 
            Usamos flex-col para móviles (uno debajo de otro) y md:flex-row para tablet/PC (en línea)
        */}
        <form 
          onSubmit={handleSearch} 
          className="flex flex-col md:flex-row items-center gap-3 md:gap-2 max-w-4xl mx-auto relative z-10"
        >
          {/* 1. Input de Ubicación */}
          <div className="relative w-full">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select 
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full pl-10 pr-4 py-3 md:py-4 rounded-xl text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none cursor-pointer text-sm"
            >
              <option value="">Selecciona ciudad...</option>
              <option value="madrid">Madrid</option>
            </select>
          </div>

          {/* 2. Select de Tipo de Comida */}
          <div className="relative w-full">
            <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select 
              value={tipoComida}
              onChange={(e) => setTipoComida(e.target.value)}
              className="w-full pl-10 pr-4 py-3 md:py-4 rounded-xl text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none cursor-pointer text-sm"
            >
              <option value="">Tipo de Comida...</option>
              <option value="italiana">Italiana</option>
              <option value="hamburguesas">Hamburguesas</option>
              <option value="mediterranea">Mediterránea</option>
              <option value="cafe">Cafetería</option>
              <option value="brunch">Brunch</option>
            </select>
          </div>

          {/* 3. Select de Entretenimiento */}
          <div className="relative w-full">
            <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select 
              value={entretenimiento}
              onChange={(e) => setEntretenimiento(e.target.value)}
              className="w-full pl-10 pr-4 py-3 md:py-4 rounded-xl text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none cursor-pointer text-sm"
            >
              <option value="">Entretenimiento...</option>
              <option value="zona-juegos">Zona de Juegos</option>
              <option value="animacion">Animación / Monitores</option>
              <option value="parque-bolas">Parque de Bolas</option>
            </select>
          </div>

          {/* 4. Botón de Buscar */}
          <button 
            type="submit" 
            className="w-full md:w-auto bg-primary text-white p-3 md:p-4 rounded-xl hover:bg-orange-600 transition-colors shadow-sm flex justify-center items-center group flex-shrink-0"
            aria-label="Buscar restaurantes"
          >
            <Search size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </form>

      </div>
    </section>
  );
}
