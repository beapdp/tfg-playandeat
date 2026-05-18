'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Image as ImageIcon, MapPin, Utensils, PlusCircle } from 'lucide-react';

export default function NuevoRestaurantePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    lat: '',
    lng: '',
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
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserId(session.user.id);
      }
    };
    checkUser();
  }, [router]);

  const toggleServicio = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(id) 
        ? prev.services.filter(s => s !== id) 
        : [...prev.services, id]
    }));
  };

  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      // 1. Generar un nombre único para la imagen
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // 2. Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('restaurantes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Obtener la URL pública
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
    e.preventDefault();
    if (!userId) return;
    
    if (!formData.imageUrl) {
      alert('Por favor, sube una imagen para tu restaurante.');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('/api/restaurantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerId: userId
        })
      });

      if (!response.ok) throw new Error('Error al crear el restaurante');

      router.push('/admin');
      router.refresh(); 
    } catch (error) {
      alert('Hubo un error al guardar. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* ... links de volver ... */}
      <Link href="/admin" className="flex items-center gap-2 text-primary font-bold hover:underline mb-8">
        <ArrowLeft size={20} />
        Volver al Panel
      </Link>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* ... cabecera ... */}
        <div className="bg-secondary p-8 text-white">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Utensils />
            Dar de alta tu negocio
          </h1>
          <p className="opacity-80 mt-2">Completa los datos para que las familias te encuentren.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ... nombre y tipo comida ... */}
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
            <div className="space-y-4">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Latitud (Mapa)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ej: 40.4168"
                    value={formData.lat}
                    onChange={e => setFormData({...formData, lat: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Longitud (Mapa)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ej: -3.7038"
                    value={formData.lng}
                    onChange={e => setFormData({...formData, lng: e.target.value})}
                  />
                </div>
              </div>
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
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <PlusCircle size={32} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 font-bold">
                      {subiendoImagen ? 'Subiendo...' : 'Click para subir foto'}
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

          {/* Servicios */}
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
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {cargando ? 'Publicando...' : <><Save size={24} /> Publicar Restaurante</>}
          </button>
        </form>
      </div>
    </div>
  );
}
