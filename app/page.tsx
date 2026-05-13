// Importamos todos los "bloques de lego" (componentes) que hemos construido
import HeroBanner from '@/components/HeroBanner';
import CategoryNav from '@/components/CategoryNav';
import FeaturedRestaurants from '@/components/FeaturedRestaurants';
import MapPromo from '@/components/MapPromo';

export default function Home() {
  return (
    /* 
      El main principal agrupa todo el contenido de la Home.
      No necesitamos mucho margen aquí porque cada componente gestiona sus propios espacios.
    */
    <main className="w-full">
      
      {/* 1. El banner azul gigante del buscador */}
      <HeroBanner />

      {/* 2. Los cuatro iconos redondos de categorías */}
      <CategoryNav />

      {/* 3. La lista de tarjetas de restaurantes de prueba */}
      <FeaturedRestaurants />

      {/* 4. La gran caja naranja que invita a ir al mapa */}
      <MapPromo />

    </main>
  );
}