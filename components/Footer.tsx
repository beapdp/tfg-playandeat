import Link from 'next/link';
// Importamos los iconos para las redes sociales desde Lucide React
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    // footer: Pie de página de la aplicación.
    // Usamos bg-secondary para el color azul oscuro y text-white para que el texto resalte.
    <footer className="bg-secondary text-white py-8 px-4 md:px-8 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center max-w-6xl gap-6">
        
        {/* === ENLACES LEGALES Y DE CONTACTO ===
            Flex-wrap permite que en móviles si no caben en una línea pasen a la siguiente
        */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-sm md:text-base opacity-90">
          <Link href="/acerca-de" className="hover:text-primary transition-colors">Acerca de</Link>
          <Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link>
          <Link href="/terminos" className="hover:text-primary transition-colors">Términos</Link>
          <Link href="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link>
        </div>

        {/* === REDES SOCIALES === 
            Lista de iconos con efecto hover para que se vuelvan naranjas al pasar el ratón
        */}
        <div className="flex gap-4">
          <Link href="#" aria-label="Facebook" className="hover:text-primary transition-colors p-2 bg-white/10 rounded-full">
            <Facebook size={20} />
          </Link>
          <Link href="#" aria-label="Twitter/X" className="hover:text-primary transition-colors p-2 bg-white/10 rounded-full">
            <Twitter size={20} />
          </Link>
          <Link href="#" aria-label="Instagram" className="hover:text-primary transition-colors p-2 bg-white/10 rounded-full">
            <Instagram size={20} />
          </Link>
          <Link href="#" aria-label="Youtube" className="hover:text-primary transition-colors p-2 bg-white/10 rounded-full">
            <Youtube size={20} />
          </Link>
        </div>

      </div>
    </footer>
  );
}
