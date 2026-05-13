// Importamos el icono de la lupa de Lucide
import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    /* CONTENEDOR PRINCIPAL AZUL (SECONDARY)
       - bg-secondary: El azul oscuro de vuestro logo.
       - rounded-3xl: Bordes muy redondeados para un look moderno y "app-like".
       - p-6 md:p-10: Menos espacio en móvil, más aire en escritorio.
       - shadow-2xl: Una sombra potente para que el buscador "flote" sobre el fondo.
    */
    <div className="bg-secondary w-full max-w-7xl mx-auto rounded-3xl p-6 md:p-10 shadow-2xl">
      
      {/* TÍTULO DEL BUSCADOR
          - text-white: Letras blancas para que contrasten con el azul.
          - text-xl md:text-3xl: Tamaño que se adapta al dispositivo.
          - leading-tight: Ajusta el interlineado para que la frase quede compacta.
      */}
      <h2 className="text-white text-center text-xl md:text-3xl font-bold mb-8 leading-tight">
        Disfruta de la Sobremesa Mientras Ellos Juegan.<br />
        Encuentra Restaurantes <span className="text-primary italic">Play&Eat</span> Cerca de Ti.
      </h2>

      {/* FORMULARIO RESPONSIVE
          - grid: Usamos el sistema de rejilla de Tailwind.
          - grid-cols-1: En móvil, los campos van uno debajo de otro.
          - md:grid-cols-4: En PC, los campos se ponen todos en la misma fila.
          - gap-4: Espacio de separación entre los inputs.
      */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* CAMPO: UBICACIÓN */}
        <select className="w-full p-4 rounded-xl bg-white text-gray-500 outline-none focus:ring-2 focus:ring-primary transition-all">
          <option value="" hidden>¿Dónde?</option>
          <option value="italiana">Madrid</option>
        </select>

        {/* CAMPO: TIPO DE COMIDA (SELECT) */}
        <select className="w-full p-4 rounded-xl bg-white text-gray-500 outline-none focus:ring-2 focus:ring-primary transition-all">
          <option value="" hidden>Tipo de Comida</option>
          <option value="italiana">Italiana</option>
          <option value="mediterranea">Mediterránea</option>
          <option value="hamburguesas">Hamburguesas</option>
        </select>

        {/* CAMPO: ENTRETENIMIENTO */}
        <input 
          type="text" 
          placeholder="¿Tipo de entretenimiento?" 
          className="w-full p-4 rounded-xl bg-white text-secondary outline-none focus:ring-2 focus:ring-primary transition-all"
        />

        {/* BOTÓN DE BÚSQUEDA (LUPA NARANJA)
            - bg-primary: Vuestro naranja corporativo.
            - hover:brightness-110: Un pequeño efecto de brillo al pasar el ratón.
            - flex items-center justify-center: Para que la lupa quede perfecta en el centro.
        */}
        <button className="bg-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg active:scale-95">
          <Search size={24} strokeWidth={3} />
          <span className="md:hidden">Buscar ahora</span> {/* Texto solo visible en móvil */}
        </button>
      </div>
    </div>
  );
}