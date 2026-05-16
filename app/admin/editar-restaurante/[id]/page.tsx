'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Image as ImageIcon, MapPin, Utensils, PlusCircle } from 'lucide-react';

export default function EditarRestaurantePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // `use(params)`: En el nuevo Next.js (App Router), los parámetros de la URL como el [id] vienen envueltos en una "Promesa"
  // Usamos el hook `use` de React para "desenvolver" esa promesa y obtener la ID real del restaurante que queremos editar.
  const { id } = use(params);
  
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    imageUrl: '',
    foodType: 'mediterranea',
    services: [] as string[]
  });

  const serviciosDisponibles = [
    { id: 'zona-juegos', label: 'Zona de Juegos' },
    { id: 'menu-infantil', label: 'Menú Infantil' },
    { id: 'cambiadores', label: 'Cambiadores' },
    { id: 'animacion', label: 'Animación' },
    { id: 'terraza', label: 'Terraza amplia' }
  ];

  useEffect(() => {
    // Definimos una función asíncrona dentro del useEffect porque useEffect no puede ser async directamente.
    const checkUserAndLoadData = async () => {
      // 1. Verificar sesión activa con Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const currentUserId = session.user.id;
      setUserId(currentUserId);

      // 2. Hacer petición GET al backend para cargar los datos actuales del restaurante
      try {
        // La variable `id` es la que sacamos de la URL arriba
        const res = await fetch(`/api/restaurantes/${id}`);
        if (!res.ok) throw new Error('Restaurante no encontrado');
        
        const data = await res.json();
        
        // 3. VERIFICACIÓN DE SEGURIDAD CRÍTICA
        // Comprobamos que el ID del usuario conectado coincide con el creador (owner_id) del restaurante.
        // Si no coinciden, significa que alguien está intentando editar un restaurante que no es suyo manipulando la URL.
        if (data.owner_id !== currentUserId) {
          alert('Acceso denegado: No tienes permiso para editar este restaurante.');
          router.push('/admin');
          return;
        }

        // 4. Rellenar los estados de React (el formulario) con los datos descargados de la BBDD
        setFormData({
          name: data.name || '',
          description: data.description || '',
          location: data.location || '',
          imageUrl: data.image_url || '',
          foodType: data.food_type || 'mediterranea',
          services: data.services || []
        });

      } catch (error) {
        console.error("Error al cargar restaurante:", error);
        alert('Error de conexión al cargar los datos.');
        router.push('/admin');
      } finally {
        // finally se ejecuta SIEMPRE, haya ido bien el try o haya saltado el catch.
        // Lo usamos para quitar la animación de carga.
        setCargandoDatos(false);
      }
    };

    // Ejecutamos la función nada más montarse el componente
    checkUserAndLoadData();
  }, [id, router]);

  const toggleServicio = (servicioId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(servicioId) 
        ? prev.services.filter(s => s !== servicioId) 
        : [...prev.services, servicioId]
    }));
  };

  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setSubiendoImagen(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('restaurantes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurantes')
        .getPublicUrl(filePath);

      setFormData({ ...formData, imageUrl: publicUrl });
    } catch (error) {
      alert('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Evitamos que la página se recargue al darle al botón de Enviar
    e.preventDefault();
    if (!userId) return;
    
    // Validación de negocio: la foto es obligatoria
    if (!formData.imageUrl) {
      alert('Por favor, asegúrate de que el restaurante tiene una imagen.');
      return;
    }

    setCargando(true);

    try {
      // Diferencia clave con la creación: Hacemos un PUT en lugar de un POST.
      // El verbo HTTP 'PUT' es el estándar RESTful para indicar una "Actualización/Modificación" completa de un recurso existente.
      const response = await fetch(`/api/restaurantes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Pasamos el userId al backend como medida de doble verificación
          ownerId: userId 
        })
      });

      if (!response.ok) throw new Error('Error al actualizar el restaurante');

      alert('¡Restaurante actualizado con éxito!');
      router.push('/admin');
      // router.refresh() le dice a Next.js que limpie la caché visual y vuelva a descargar los datos más recientes de la base de datos
      router.refresh(); 
    } catch (error) {
      alert('Hubo un error al guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-500 font-medium italic">Cargando datos del restaurante...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/admin" className="flex items-center gap-2 text-primary font-bold hover:underline mb-8">
        <ArrowLeft size={20} />
        Volver al Panel
      </Link>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-secondary p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Utensils />
              Editar Restaurante
            </h1>
            <p className="opacity-80 mt-2">Modifica los datos de {formData.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nombre del Restaurante</label>
              <input 
                type="text" 
                required
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Ej: El Rincón de los Peques"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Tipo de Comida</label>
              <select 
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                value={formData.foodType}
                onChange={e => setFormData({...formData, foodType: e.target.value})}
              >
                <option value="mediterranea">Mediterránea</option>
                <option value="italiana">Italiana</option>
                <option value="hamburgueseria">Hamburguesería</option>
                <option value="asiatica">Asiática</option>
                <option value="tradicional">Tradicional</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Descripción corta</label>
            <textarea 
              rows={3}
              required
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Cuéntanos qué os hace especiales para las familias..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin size={16} /> Ubicación (Ciudad)
              </label>
              <input 
                type="text" 
                required
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Ej: Madrid, Valencia..."
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} /> Foto del Restaurante
              </label>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary transition-colors bg-gray-50">
                {formData.imageUrl ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, imageUrl: ''})}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs hover:scale-110 transition-transform shadow-md"
                      title="Cambiar imagen"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <PlusCircle size={32} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 font-bold">
                      {subiendoImagen ? 'Subiendo...' : 'Click para subir foto nueva'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={subiendoImagen}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700">Servicios disponibles para familias</label>
            <div className="flex flex-wrap gap-3">
              {serviciosDisponibles.map(servicio => (
                <button
                  key={servicio.id}
                  type="button"
                  onClick={() => toggleServicio(servicio.id)}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                    formData.services.includes(servicio.id)
                      ? 'bg-primary border-primary text-white shadow-md scale-105'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-primary'
                  }`}
                >
                  {servicio.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={cargando}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {cargando ? 'Guardando cambios...' : <><Save size={24} /> Guardar Cambios</>}
          </button>
        </form>
      </div>
    </div>
  );
}
