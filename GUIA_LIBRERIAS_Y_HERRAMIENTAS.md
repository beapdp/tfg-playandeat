# 📦 Guía de Librerías y Herramientas del Proyecto

Esta guía explica en detalle **cada librería, herramienta y función** que se utiliza en Play & Eat: qué es, para qué sirve y en qué archivos del proyecto aparece.

---

## Concepto Previo: ¿Librería vs. Framework?

Antes de empezar, es importante entender la diferencia:

- **Librería:** Una caja de herramientas especializada que instalas para hacer *una cosa concreta*. Tú decides cuándo y cómo usarla. Ejemplo: `lucide-react` solo sirve para iconos.
- **Framework:** El *edificio entero* sobre el que construyes la aplicación. No lo importas para una cosa, define la estructura de todo el proyecto. Ejemplo: `Next.js`. Dentro de él vienen incluidas muchas herramientas propias sin necesidad de instalar nada extra.

---

## BLOQUE 1: Las Librerías Externas (las que se instalan)

Estas son las librerías que aparecen en el archivo `package.json` y que se instalan con `npm install`.

---

### 1.1 `@supabase/supabase-js` — La conexión con Supabase

**¿Qué es?**
Es la librería oficial de Supabase para JavaScript/TypeScript. Es el "puente" entre vuestro código y todos los servicios de Supabase (base de datos, autenticación y storage de fotos).

**¿Cómo se usa en el proyecto?**
Se configura una sola vez en el archivo centralizado `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(URL, CLAVE);
```

La función `createClient` recibe la dirección de vuestra base de datos y una clave de acceso, y devuelve el objeto `supabase` — una herramienta ya configurada y lista para usarse en cualquier parte del proyecto.

**¿Qué permite hacer?**
- `supabase.from('restaurantes').select(...)` → Leer datos de la base de datos.
- `supabase.from('favoritos').insert(...)` → Insertar nuevos registros.
- `supabase.from('favoritos').delete()` → Borrar registros.
- `supabase.auth.signUp(...)` → Registrar un nuevo usuario (con bcrypt automático).
- `supabase.auth.signInWithPassword(...)` → Hacer login y obtener el token JWT.
- `supabase.auth.getUser()` → Obtener el usuario con sesión activa.
- `supabase.auth.signOut()` → Cerrar sesión.
- `supabase.storage.from('restaurantes').upload(...)` → Subir una foto al storage.

**¿En qué archivos se importa?**
- `lib/supabase.ts` → Configuración inicial (el único sitio donde se llama a `createClient`).
- `lib/backend/services/authService.ts` → Para Auth (registro, login, perfiles).
- `lib/backend/services/restaurantService.ts` → Para leer y escribir restaurantes.
- `lib/backend/services/favoriteService.ts` → Para gestionar favoritos.
- `components/Header.tsx` → Para el botón de cerrar sesión.
- `components/RestaurantCard.tsx` → Para el botón de corazón de favoritos.
- `app/login/page.tsx` → Para el formulario de login.
- `app/registro/page.tsx` → Para el formulario de registro.
- `app/favoritos/page.tsx` → Para cargar los favoritos del usuario.

---

### 1.2 `lucide-react` — Los iconos de la aplicación

**¿Qué es?**
Es una librería de iconos SVG listos para usar como componentes de React. Contiene miles de iconos y permite personalizarlos (tamaño, color, grosor).

**¿Por qué se eligió?**
Es ligera, moderna, con iconos de alta calidad y perfectamente compatible con React y TypeScript.

**¿Qué iconos se usan en el proyecto?**

| Icono importado | Dónde se usa | Para qué |
|---|---|---|
| `Heart` | `RestaurantCard.tsx` | El corazón del botón de favoritos |
| `HeartOff` | `app/favoritos/page.tsx` | Cuando la lista de favoritos está vacía |
| `Star` | `RestaurantCard.tsx` | Las estrellas de valoración |
| `Search` | Varios archivos | El icono de la lupa de búsqueda |
| `Menu`, `X` | `Header.tsx` | El menú hamburguesa (abrir/cerrar en móvil) |
| `LogOut` | `Header.tsx` | El botón de cerrar sesión |
| `User` | `Header.tsx`, `perfil` | El icono de perfil de usuario |
| `Coffee`, `UtensilsCrossed`, `Wine`, `Croissant` | `CategoryNav.tsx` | Los iconos de categorías (Brunch, Comida, Cena...) |
| `Facebook`, `Twitter`, `Instagram`, `Youtube` | `Footer.tsx` | Los iconos de redes sociales |
| `Users`, `Store` | `registro/page.tsx` | Los iconos de los roles (Familia/Negocio) |
| `Bell`, `Moon`, `Globe`, `Shield` | `perfil/ajustes` | Los iconos del panel de ajustes |
| `ChevronLeft` | `app/favoritos/page.tsx` | La flecha de volver atrás |
| `Shapes`, `Palette`, `Music` | `RestaurantCard.tsx` | Los iconos de servicios del restaurante |
| `Settings` | `perfil/page.tsx` | El icono de ajustes |

---

### 💡 Preguntas para la Defensa (Sección Iconos)

**1. ¿Por qué habéis usado Lucide React y no otra librería como FontAwesome?**
- **Respuesta:** *"Elegimos Lucide por su **minimalismo y modernidad**. A diferencia de otras librerías, Lucide genera iconos en formato **SVG real**, lo que nos permite personalizarlos fácilmente mediante clases de CSS o Tailwind (cambiar el color, el grosor del trazo o el tamaño). Además, es muy ligera y se integra de forma nativa con React como componentes individuales"*.

**2. ¿Cómo ayudáis al rendimiento de la web al usar estos iconos?**
- **Respuesta:** *"Gracias a una técnica llamada **Tree Shaking**. Al importar cada icono de forma individual (ej: `import { Heart } from 'lucide-react'`), Next.js solo incluye en el paquete final el código de los iconos que realmente estamos usando, eliminando los miles de iconos restantes de la librería. Esto hace que la web cargue mucho más rápido"*.

**3. ¿Qué ventajas tiene que los iconos sean componentes de React?**
- **Respuesta:** *"Nos permite tratarlos como cualquier otro elemento de la interfaz. Podemos pasarles 'props' para cambiar su comportamiento dinámicamente, como por ejemplo cambiar el color del icono del corazón de gris a rojo cuando el usuario marca un restaurante como favorito"*.

---

### 1.3 `react` y `react-dom` — La base de la interfaz

**¿Qué son?**
`react` es la librería que permite escribir la interfaz como componentes reutilizables. `react-dom` es la parte que "pinta" esos componentes en el navegador.

Aunque Next.js los incluye conceptualmente, se instalan como dependencias separadas.

**¿Qué se importa de React en el proyecto?**

- `useState` → Guarda un valor que puede cambiar y actualiza la pantalla cuando lo hace. Ejemplo: guardar si el corazón de favoritos está activo o no.
- `useEffect` → Ejecuta código cuando el componente aparece en pantalla. Ejemplo: cargar los favoritos del usuario cuando abre la página.

```typescript
import { useState, useEffect } from 'react';
```

---

### 1.4 `leaflet` y `react-leaflet` — El Mapa Interactivo

**¿Qué son?**
`leaflet` es la librería de mapas de código abierto más utilizada en el mundo (una alternativa profesional y gratuita a Google Maps). `react-leaflet` es el "puente" que nos permite usar Leaflet como si fueran componentes normales de React (`<MapContainer>`, `<Marker>`, etc.).

**¿Para qué sirven en el proyecto?**
Se encargan de renderizar el mapa interactivo en la sección `/mapa`. Permiten que el usuario vea dónde están situados los restaurantes, se desplace por el mapa y haga zoom.

**¿Qué componentes clave usamos?**
- `<MapContainer>`: Es el cuadro principal donde se dibuja el mapa.
- `<TileLayer>`: Define de dónde vienen las imágenes del mapa (usamos **OpenStreetMap**, que es libre y gratuito).
- `<Marker>`: Son los "pines" o marcadores naranjas que indican la posición exacta de cada restaurante.
- `<Popup>`: La ventanita que aparece al hacer clic en un pin con la foto y el nombre del local.

**¿En qué archivos aparecen?**
- `components/RestaurantsMap.tsx` → Donde está programada toda la lógica visual del mapa.
- `components/MapWrapper.tsx` → El envoltorio que usamos para que Next.js cargue el mapa correctamente.
- `app/mapa/page.tsx` → La página principal que muestra el mapa al usuario.

---

### 💡 Preguntas para la Defensa (Sección Mapa)

Si el tribunal os pregunta por esta parte, aquí tenéis las respuestas clave:

**1. ¿Por qué habéis usado Leaflet y no Google Maps?**
- **Respuesta:** *"Principalmente por tres motivos: **Gratuidad, Privacidad y Ética del Código Abierto**. Google Maps requiere vincular una tarjeta de crédito y tiene costes por cada visualización. Leaflet es una librería de código abierto que nos permite ofrecer la misma funcionalidad profesional sin dependencias comerciales. Además, para el alcance de este TFG, Leaflet es más ligero y se integra perfectamente con React"*.

**2. ¿De dónde salen las imágenes de las calles?**
- **Respuesta:** *"Usamos **OpenStreetMap**. Es como la 'Wikipedia de los mapas'. Es una base de datos cartográfica colaborativa y gratuita que Leaflet utiliza para pintar las baldosas (tiles) del mapa"*.

**3. He visto que usáis un `MapWrapper` con carga dinámica, ¿por qué?**
- **Respuesta:** *"Es una decisión técnica para optimizar el rendimiento. Los mapas interactivos necesitan acceder al objeto `window` del navegador. Como Next.js intenta renderizar las páginas en el servidor primero (donde no existe el navegador), usamos una carga dinámica con `ssr: false` para evitar errores de ejecución y asegurar que el mapa solo se cargue cuando el usuario ya tiene la web abierta"*.

**4. ¿Qué pasa si un restaurante no tiene coordenadas en la base de datos?**
- **Respuesta:** *"El sistema es robusto: antes de pintar el mapa, el código aplica un filtro que descarta automáticamente cualquier local que no tenga latitud o longitud. Así evitamos errores visuales o 'pines' que aparecen en medio del océano o en el punto (0,0)"*.

---

## BLOQUE 2: Las Herramientas de Next.js (incluidas en el framework)

Estas NO se instalan por separado. Vienen incluidas dentro de `next` y se importan directamente desde él. Son como los "electrodomésticos" que ya vienen integrados en el edificio.

---

### 2.1 `next/image` → Componente `<Image>`

**¿Qué hace?**
Sustituye al `<img>` normal de HTML. Optimiza automáticamente las imágenes: las comprime, las adapta al tamaño exacto de la pantalla del usuario y las carga de forma "perezosa" (lazy loading) — solo cuando el usuario está a punto de verlas.

**¿Por qué importa?**
Mejora enormemente la velocidad de carga de la web y es un requisito para obtener buena puntuación en métricas de rendimiento.

**¿Dónde se usa?**
- `components/Header.tsx` → Para el logotipo.
- `components/RestaurantCard.tsx` → Para la foto de cada restaurante en las tarjetas.
- `app/restaurantes/[id]/page.tsx` → Para la foto grande en la ficha de detalle.

```typescript
import Image from 'next/image';
// Uso:
<Image src={restaurante.imageUrl} alt={restaurante.name} fill />
```

---

### 2.2 `next/link` → Componente `<Link>`

**¿Qué hace?**
Sustituye a la etiqueta `<a>` de HTML para navegar entre páginas. La diferencia clave es que `<Link>` navega **sin recargar el navegador completo**, haciendo la transición mucho más rápida y fluida (comportamiento de SPA - Single Page Application).

**¿Dónde se usa?**
En prácticamente todos los archivos: menú de navegación, botones de acción, tarjetas de restaurante, enlaces del footer...

```typescript
import Link from 'next/link';
// Uso:
<Link href="/restaurantes/123">Ver restaurante</Link>
```

---

### 2.3 `next/navigation` → Hook `useRouter`

**¿Qué hace?**
Permite redirigir al usuario a otra página **desde el código JavaScript**, no desde un enlace que el usuario pulsa. Es esencial para redirigir después de acciones (login, registro, etc.).

**¿Dónde se usa?**
- `app/login/page.tsx` → Para redirigir a `/perfil` o `/admin` tras el login.
- `app/registro/page.tsx` → Para redirigir tras el registro.
- `components/Header.tsx` → Para redirigir al home tras cerrar sesión.
- `app/perfil/page.tsx` → Para redirigir a `/login` si no hay sesión.

```typescript
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/perfil'); // Redirige al usuario
```

---

### 2.4 `next/server` → `NextResponse`

**¿Qué hace?**
Es la herramienta para construir las **respuestas de la API REST**. Permite devolver datos en formato JSON, establecer códigos de estado HTTP (200 OK, 400 Bad Request, 401 No autorizado, 500 Error interno) y cabeceras.

**¿Dónde se usa?**
En todos los controladores del backend:
- `lib/backend/controllers/authController.ts`
- `lib/backend/controllers/restaurantController.ts`

```typescript
import { NextResponse } from 'next/server';

// Respuesta de éxito
return NextResponse.json({ message: 'OK' }, { status: 200 });

// Respuesta de error de autenticación
return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
```

---

### 2.5 `next/font/google` → Fuente `Poppins`

**¿Qué hace?**
Permite cargar fuentes tipográficas de Google Fonts de forma optimizada, directamente desde Next.js, sin necesidad de añadir etiquetas `<link>` en el HTML manualmente.

**¿Dónde se usa?**
- `app/layout.tsx` → Se importa y aplica la tipografía `Poppins` a toda la aplicación.

```typescript
import { Poppins } from 'next/font/google';
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'] });
```

---

### 2.6 `next` → `Metadata`

**¿Qué hace?**
Es un tipo de TypeScript que permite definir los metadatos SEO de cada página (el título que aparece en la pestaña del navegador, la descripción que aparece en Google, etc.).

**¿Dónde se usa?**
- `app/layout.tsx` → Para definir el título y descripción global de la web.

```typescript
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Play & Eat | Restaurantes para Familias',
  description: 'Encuentra restaurantes con zonas de juego para niños',
};
```

---

### 2.7 API Routes — El Sistema de Backend de Next.js

**¿Qué son?**
No es una función que se importa, sino una **convención del framework**. Cualquier archivo llamado `route.ts` dentro de la carpeta `app/api/` se convierte automáticamente en un endpoint de vuestra API REST.

**¿Cómo funciona?**
Si creas la carpeta `app/api/favoritos/route.ts`, Next.js automáticamente crea la URL `/api/favoritos` en vuestro servidor, lista para recibir peticiones.

**Endpoints creados en el proyecto:**

| Archivo | URL del endpoint | Para qué sirve |
|---|---|---|
| `app/api/auth/registro/route.ts` | `POST /api/auth/registro` | Registrar un nuevo usuario |
| `app/api/auth/login/route.ts` | `POST /api/auth/login` | Iniciar sesión |
| `app/api/auth/perfil/route.ts` | `GET /api/auth/perfil` | Obtener datos del perfil |
| `app/api/restaurantes/route.ts` | `GET/POST /api/restaurantes` | Listar y crear restaurantes |
| `app/api/favoritos/route.ts` | `POST /api/favoritos` | Gestionar favoritos |

---

## Resumen Total: Mapa de Importaciones del Proyecto

```
LIBRERÍAS EXTERNAS (package.json)
├── @supabase/supabase-js  →  Base de datos, Auth y Storage
├── lucide-react           →  Todos los iconos de la interfaz
├── react                  →  useState, useEffect
├── react-dom              →  Renderizado en el navegador
└── leaflet/react-leaflet  →  Mapa interactivo y geolocalización

HERRAMIENTAS DE NEXT.JS (incluidas en el framework)
├── next/image    →  <Image>       Fotos optimizadas
├── next/link     →  <Link>        Navegación rápida sin recarga
├── next/navigation → useRouter   Redirección desde código
├── next/server   →  NextResponse  Respuestas de la API REST
├── next/font     →  Poppins       Tipografía de Google Fonts
└── next (tipo)   →  Metadata      SEO de las páginas
```
