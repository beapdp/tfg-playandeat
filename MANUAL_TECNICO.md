# 📘 Manual Técnico de Defensa Avanzado: Play & Eat (TFG)

Este manual detalla la arquitectura, tecnologías y decisiones de diseño tomadas para el desarrollo de la plataforma **Play & Eat**.

---

## 1. Stack Tecnológico: El Porqué de cada Elección

### **Lenguaje: TypeScript**
*   **Qué es:** JavaScript con "superpoderes" de tipado.
*   **Por qué:** Evita errores comunes durante el desarrollo (por ejemplo, intentar leer un dato que no existe). Demuestra rigor técnico y profesionalidad.

### **Framework: Next.js (API Routes)**
*   **¿Qué son las API Routes?:** Son funciones de servidor que viven dentro de Next.js. Permiten que nuestra aplicación tenga un **Backend propio** sin necesidad de otro servidor aparte.
*   **Funcionamiento (Carpetas = Rutas):** Next.js usa "File-based Routing". 
    *   Cada carpeta dentro de `app/api` se convierte en una dirección URL automáticamente.
    *   Es un sistema muy organizado que separa las "ventanillas de atención" (rutas) de la lógica visual.

### **Estilos: Tailwind CSS**
*   **Integración:** Se configura en `tailwind.config.ts` y se aplica globalmente.
*   **Funcionamiento:** Permite diseñar rápido usando clases de utilidad (como `text-primary`). Es ideal para que la web sea responsiva (móvil/PC) de forma nativa.

### **Infraestructura: Supabase (Base de Datos)**
*   **Rol:** Es nuestra **Infraestructura** (Almacén), pero **no es nuestro Backend**.
*   **PostgreSQL:** El motor de base de datos más robusto del mercado.
*   **Scripts SQL:** Usamos código SQL para crear la estructura (tablas, columnas, permisos) y los buckets de almacenamiento de fotos.

### **Geolocalización: Leaflet + OpenStreetMap**
*   **Qué es:** Un motor de mapas interactivos de código abierto.
*   **Por qué:** Es la alternativa gratuita y profesional a Google Maps. Nos permite mostrar los restaurantes en un mapa real sin costes de API y respetando la privacidad del usuario. 
*   **OpenStreetMap:** La base de datos cartográfica libre que usamos como fuente de datos para las imágenes del mapa.

---

## 2. Estructura del Proyecto (Arquitectura de Carpetas)

Para mantener un proyecto escalable, hemos organizado los archivos siguiendo las convenciones de Next.js y el patrón de **Arquitectura en Capas**:

```text
📂 TFG-PLAYANDEAT
├── 📂 app/                 # 🏠 RUTAS Y PÁGINAS (App Router)
│   ├── 📂 api/             # 🔌 API REST (Backend Interno)
│   │   ├── 📂 auth/        # Registro e inicio de sesión
│   │   ├── 📂 favoritos/   # Gestión de favoritos
│   │   ├── 📂 restaurantes/# Gestión de locales
│   │   └── 📂 valoraciones/# Gestión de opiniones y estrellas [NUEVO]
│   ├── 📂 admin/           # 🛠️ Panel de Administración (Negocios)
│   ├── 📂 buscar/          # 🔍 Página de Búsqueda y Filtros
│   ├── 📂 favoritos/       # ❤️ Lista de favoritos del usuario
│   ├── 📂 mapa/            # 🗺️ Sección de Mapa Interactivo
│   ├── 📂 perfil/          # 👤 Ajustes de perfil de usuario
│   ├── 📂 restaurantes/    # 📄 Ficha de detalle [id] y reviews
│   ├── 📄 layout.tsx       # 🖼️ Estructura global (Header/Footer)
│   └── 📄 page.tsx         # 🏠 Home (Página de Inicio)
│
├── 📂 components/          # 🧩 COMPONENTES UI (Piezas de Lego)
│   ├── 📄 Header.tsx       # 🧭 Navegación superior
│   ├── 📄 RestaurantCard.tsx # 🪪 Tarjetas de restaurante
│   ├── 📄 RestaurantsMap.tsx # 📍 Componente del Mapa (Leaflet)
│   ├── 📄 RestaurantReviews.tsx # ⭐️ Sistema visual interactivo de reseñas [NUEVO]
│   └── ...                 # (Botones, Banners, Buscadores)
│
├── 📂 lib/                 # 🧠 EL CEREBRO DEL PROYECTO
│   ├── 📄 supabase.ts      # ☁️ Cliente de conexión a Supabase
│   └── 📂 backend/         # ⚙️ Lógica de Servidor
│       ├── 📂 controllers/ # 👔 Validadores y Respuesta API
│       │   └── 📄 valoracionController.ts # Valida reseñas y notas [NUEVO]
│       └── 📂 services/    # 🍳 Acceso a BBDD (SQL/Queries)
│           └── 📄 valoracionService.ts # Inserción y recálculo de medias [NUEVO]
│
├── 📂 public/              # 🖼️ ARCHIVOS ESTÁTICOS (Logo, imágenes)
├── 📂 styles/              # 🎨 ESTILOS GLOBALES (Tailwind/CSS)
└── 📄 .env.local           # 🔑 Claves secretas de la BBDD
```

### **Descripción de las Carpetas Principales:**

1.  **`/app`**: Es el corazón de la navegación. Next.js crea una URL por cada carpeta que contenga un archivo `page.tsx`. Si el archivo es `route.ts`, se convierte en un endpoint de la API. Con la ruta `/api/valoraciones` damos soporte al nuevo flujo de opiniones.
2.  **`/components`**: Contiene las piezas visuales reutilizables. Separar los componentes de las páginas nos permite que el código sea mucho más limpio y fácil de mantener. El nuevo `RestaurantReviews.tsx` encapsula el formulario interactivo de estrellas.
3.  **`/lib/backend`**: Aquí es donde vive la "magia" del servidor. Hemos separado la lógica en **Controllers** (que gestionan la comunicación con la web) y **Services** (que gestionan los datos puros de la base de datos).
4.  **`/public`**: Almacena los recursos que no cambian, como el icono de la web o el logo de Play & Eat.

---

## 3. Arquitectura en Capas: El Patrón Restaurante

Hemos separado el código en capas para cumplir con estándares profesionales de ingeniería:

1.  **Frontend:** El cliente pide (componentes visuales).
2.  **API Route:** El timbre de la cocina (puntos de entrada de Next.js).
3.  **Controller:** El camarero que valida el pedido y responde con **NextResponse** si las estrellas son correctas o faltan datos.
4.  **Service:** El cocinero que prepara los datos consultando la despensa (Supabase), aplicando cálculos matemáticos como la media aritmética del restaurante.

**¿Por qué lo hacemos así?** 
Para que el código sea **desacoplado**. Si cambiamos la base de datos, solo tocamos la capa de *Service*. Si cambiamos la web por una app móvil, el *Backend* (Controllers y Services) sigue sirviendo igual.

---

## 4. Conceptos Clave para la Defensa

*   **`NextResponse`**: Herramienta de Next.js necesaria para que el servidor envíe respuestas (OK 200, Conflicto 409, Error 500) al navegador.
*   **`user_metadata`**: Técnica avanzada para guardar el **Rol** (familia/negocio) dentro de la sesión del usuario, haciendo que la carga sea instantánea.

---

## 5. De Datos Estáticos a Datos Dinámicos (La "Web Viva")

Es fundamental entender la evolución del proyecto durante su desarrollo:

*   **Fase Inicial (Mock Data):** Al principio, los restaurantes estaban escritos directamente en el código (`MOCK_RESTAURANTS`). Eran "artificiales". Si querías cambiar un nombre, tenías que editar el código.
*   **Fase Actual (Dynamic Data):** Hemos eliminado los datos del código y ahora el componente `FeaturedRestaurants.tsx` solicita los datos a la base de datos en tiempo real. 
*   **Ventaja:** Esto convierte al proyecto en una aplicación profesional donde los administradores pueden gestionar el contenido sin saber programar, simplemente usando el panel de Supabase o el propio panel de administración de la web.

---

## 6. Gestión de la Infraestructura (Supabase)

Como programador, puedes gestionar todo desde el panel de Supabase:
1.  **Table Editor:** Para ver y editar las tablas (`restaurantes`, `perfiles`, `valoraciones`). Es como un Excel de tu base de datos.
2.  **Storage:** Donde se guardan físicamente las fotos que suben los dueños de negocios.
3.  **Authentication:** Donde puedes ver la lista de emails registrados y sus IDs únicos (UUID).

**Sobre los Scripts SQL:**
La estructura de estas tablas no apareció por arte de magia. Se crearon ejecutando **Scripts SQL** en la consola de Supabase. Estos scripts definen:
*   El **Esquema**: Qué columnas tiene cada tabla y de qué tipo son (Texto, Números, Fechas). Incluye los campos `lat` y `lng` (NUMERIC) para la geolocalización.
*   Las **Relaciones**: Por ejemplo, que una valoración pertenece a un `perfil_id` y a un `restaurante_id`.
*   Las **Políticas RLS**: Quién puede leer o escribir datos de forma segura.
*   **Storage Buckets**: Almacenes de archivos para las fotos de los restaurantes, con URLs públicas vinculadas a la base de datos.

---

## 7. Arquitectura del Frontend: Las piezas del puzzle

Nuestra aplicación sigue una filosofía **Modular**. En lugar de escribir un código gigante para cada página, la hemos dividido en pequeñas piezas llamadas **Componentes**.

### **A. Los Componentes (`/components`)**
Son como bloques de Lego que podemos usar en cualquier sitio:
*   **`Header.tsx`**: La barra de navegación superior. Contiene la lógica para detectar si el usuario ha iniciado sesión y muestra el botón de "Mi Panel" o "Salir".
*   **`HeroBanner.tsx`**: La zona azul superior con el buscador. Es la primera impresión del usuario ("Hero" significa héroe o protagonista en diseño web).
*   **`CategoryNav.tsx`**: Los 4 iconos redondos (Brunch, Comida, etc.). Sirven para filtrar la lista de restaurantes de forma rápida.
*   **`FeaturedRestaurants.tsx`**: El "contenedor" que va a la base de datos, trae los restaurantes y los organiza en una cuadrícula.
*   **`RestaurantCard.tsx`**: El diseño de una sola tarjeta de restaurante. Se repite tantas veces como restaurantes haya en la base de datos.
*   **`MapPromo.tsx`**: Una caja informativa que invita al usuario a usar el buscador por mapa.
*   **`MapWrapper.tsx`**: Un componente "puente" que gestiona la carga dinámica del mapa para asegurar la compatibilidad con el renderizado en servidor (SSR).
*   **`RestaurantsMap.tsx`**: El núcleo del mapa interactivo que renderiza los marcadores y popups de Leaflet.
*   **`RestaurantReviews.tsx`**: El panel dinámico para que las familias publiquen su puntuación y lean la lista completa de valoraciones anteriores.

### **B. Las Páginas (`/app`)**
Las páginas son los archivos que definen las direcciones URL de nuestra web:
*   **`page.tsx` (Home)**: Es la página de inicio. Su única función es **importar y ordenar** los componentes que hemos visto arriba.
*   **`app/mapa/page.tsx`**: La página dedicada al mapa interactivo global.
*   **`app/restaurantes/[id]/page.tsx`**: Es la página de detalle. Usa el ID de la URL para pedir al servidor la información de UN solo restaurante y mostrarla en pantalla grande, e integra el panel `<RestaurantReviews />`.
*   **`app/admin/page.tsx`**: El panel de control para los dueños de negocios.
*   **`app/perfil/page.tsx`**: La zona privada para las familias.

### **¿Por qué esta estructura?**
Si el profesor te pregunta, la respuesta es: **"Por mantenibilidad"**. Si queremos cambiar el diseño de la tarjeta de restaurante, solo tenemos que tocar un archivo (`RestaurantCard.tsx`) y el cambio se aplicará automáticamente en toda la web (Home, favoritos, buscador, etc.). Esto ahorra tiempo y evita errores.

---

## 8. Arquitectura del Backend: Los engranajes

El Backend es el conjunto de procesos que ocurren en el servidor. En nuestro caso, se divide en tres niveles de profundidad:

### **A. Las Rutas de la API (`/app/api`)**
Son los puntos de entrada. Cada archivo `route.ts` es una dirección a la que el Frontend puede llamar:
*   **`api/auth/registro`**: Recibe los datos del nuevo usuario.
*   **`api/restaurantes`**: Devuelve la lista de restaurantes (GET) o guarda uno nuevo (POST).
*   **`api/restaurantes/[id]`**: Sirve para pedir los datos de un restaurante concreto usando su ID.
*   **`api/valoraciones`**: Endpoint para leer opiniones y procesar la creación de nuevas valoraciones.

### **B. Los Controladores (`/lib/backend/controllers`)**
Son los "cerebros" intermedios. Su trabajo es validar que los datos sean correctos antes de enviarlos a la base de datos:
*   **`authController.ts`**: Comprueba que el registro de usuario tenga email, nombre y rol. Si falta algo, devuelve un error 400.
*   **`restaurantController.ts`**: Se encarga de procesar la creación de nuevos restaurantes, asegurándose de que la imagen y el dueño estén bien asignados.
*   **`valoracionController.ts`**: Controla que la sesión exista, que el usuario sea tipo 'familia', y que no intente duplicar opiniones.

### **C. Los Servicios (`/lib/backend/services`)**
Son los que realmente "tocan" Supabase. No saben nada de internet, solo de bases de datos:
*   **`authService.ts`**: Contiene la lógica para crear el perfil en la tabla `perfiles` y gestionar el login.
*   **`restaurantService.ts`**: Se encarga de hacer los `SELECT` (leer) y los `INSERT` (escribir) en la tabla de restaurantes. También incluye los filtros de búsqueda (por ubicación, tipo de comida, etc.).
*   **`valoracionService.ts`**: Escribe las opiniones en la tabla `valoraciones` y ejecuta el recálculo matemático de la nota promedio de estrellas en la base de datos de forma dinámica.

---

## 9. Sistema de Geolocalización: El Mapa Interactivo

Hemos implementado un sistema de cartografía dinámica basado en **Leaflet**. Este sistema sigue una arquitectura de **Carga Híbrida**:

1.  **Obtención de Coordenadas:** Los datos de latitud y longitud se almacenan en la tabla `restaurantes` como tipos `NUMERIC`.
2.  **Carga Dinámica (Dynamic Import):** Debido a que la librería Leaflet necesita acceso directo al navegador (`window`), la cargamos usando `next/dynamic` con la opción `ssr: false`. Esto evita que el servidor intente renderizar el mapa, lo cual causaría un error.
3.  **Renderizado de Capas (Layers):** El mapa se construye mediante capas:
    *   **Tile Layer:** Proporciona el diseño visual del mapa (OpenStreetMap).
    *   **Marker Layer:** Posiciona los iconos de los restaurantes basándose en sus coordenadas.
    *   **Popup Layer:** Muestra información contextual al interactuar con el mapa.

---

## 10. Sistema de Valoraciones (Reseñas y Estrellas)

El sistema de valoraciones permite a los perfiles tipo **Familia** calificar restaurantes con una nota entre 1 y 5 estrellas, junto a un comentario opcional:

1.  **Restricción Unique:** A nivel de base de datos (`valoraciones`), una clave única compuesta `(perfil_id, restaurante_id)` impide opiniones duplicadas.
2.  **Cálculo Asíncrono en Servidor:** Cada vez que se crea una valoración exitosa, el backend consulta el listado completo de reseñas asociadas al restaurante, calcula el promedio matemático en la capa de servicios (`valoracionService.ts`) y actualiza el campo `rating` en la tabla `restaurantes` con un solo decimal. Esto optimiza el rendimiento reduciendo los tiempos de lectura futura.
3.  **Interfaz Interactiva:** Pinta las estrellas usando colores dinámicos e interactividad táctil/ratón en React para mejorar enormemente la UX (experiencia de usuario).

---

## 11. Guía de Instalación y Ejecución Local

Para que tus compañeros puedan ejecutar este proyecto en sus ordenadores, deben seguir estos pasos:

### **1. Requisitos Previos**
*   Tener instalado **Node.js** (versión 18 o superior).
*   Un editor de código como **Visual Studio Code**.

### **2. Instalación de Dependencias**
Una vez abierta la carpeta del proyecto en la terminal, deben ejecutar el siguiente comando para descargar todas las librerías necesarias (Next.js, Lucide, Tailwind, etc.):
```bash
npm install
```

### **3. Configuración de Variables de Entorno (IMPORTANTE)**
El archivo **`.env.local`** contiene las llaves para conectar con la base de datos de Supabase. 
*   **Si les pasas el proyecto comprimido:** Asegúrate de incluir este archivo en el ZIP.
*   Si no está, deberán crear un archivo llamado `.env.local` en la raíz y pegar las claves `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### **4. Ejecución del Proyecto**
Para arrancar la web en modo desarrollo, deben ejecutar:
```bash
npm run dev
```
La web estará disponible en [http://localhost:3000](http://localhost:3000).

### **5. Consideraciones de Base de Datos**
Como estamos usando una base de datos en la nube (Supabase), tus compañeros **no necesitan instalar SQL ni bases de datos locales**. La web se conectará automáticamente al servidor central que ya hemos configurado. Todo lo que ellos creen o borren se reflejará en la base de datos compartida.

---

**CONSEJO PARA EL EXAMEN:**
Si el profesor te pregunta por qué has complicado tanto la estructura con carpetas `api`, `lib`, `controllers` y `services`, dile que has seguido una **Arquitectura en Capas profesional** para asegurar que el proyecto sea mantenible, escalable y que la lógica de negocio esté separada de la base de datos.

---

## 🎓 Anexo: Posibles Preguntas del Tribunal (Q&A de Defensa)

Aquí tienes una selección de preguntas "trampa" o técnicas que suelen hacer los profesores, con la respuesta ideal para quedar muy bien:

**1. ¿Por qué habéis usado Next.js en lugar de solo React con Vite?**
- **Respuesta:** *"Next.js es un framework completo que nos ofrece **Renderizado en el Servidor (SSR)**, lo cual es vital para el SEO y la velocidad de carga inicial. Además, nos permite tener nuestro propio **Backend (API Routes)** en el mismo proyecto, simplificando el despliegue y la comunicación entre el cliente y el servidor"*.

**2. ¿Qué ventaja real tiene separar 'Controllers' de 'Services'?**
- **Respuesta:** *"Es el principio de **Responsabilidad Única**. El Controller solo se preocupa de la comunicación con la web (validar la petición y dar la respuesta), mientras que el Service solo se preocupa de los datos. Esto hace que el código sea mucho más fácil de testear y que, si mañana queremos cambiar de base de datos, solo tengamos que tocar los Services sin romper el resto de la aplicación"*.

**3. ¿Cómo garantizáis que un usuario no pueda borrar el restaurante de otro?**
- **Respuesta:** *"Implementamos seguridad en dos niveles. Primero, en el Backend validamos el **owner_id** antes de cualquier operación de edición. Segundo, en Supabase utilizamos **RLS (Row Level Security)**, unas políticas a nivel de base de datos que impiden que cualquier usuario acceda o modifique filas que no le pertenecen, incluso si intentaran saltarse nuestra web"*.

**4. ¿Por qué habéis elegido Tailwind CSS y no CSS puro o Bootstrap?**
- **Respuesta:** *"Tailwind nos permite un desarrollo mucho más ágil mediante clases de utilidad. Además, genera archivos CSS finales extremadamente pequeños porque solo incluye las clases que realmente estamos usando en el código. Esto mejora el rendimiento y nos facilita enormemente que la web sea totalmente **responsiva** (móvil/PC)"*.

**5. ¿Cómo manejáis las imágenes para que no pesen demasiado?**
- **Respuesta:** *"Usamos el componente `<Image>` de Next.js. Este componente realiza una optimización automática de las imágenes en tiempo real, convirtiéndolas a formatos modernos como WebP y adaptando su resolución al tamaño de la pantalla del usuario"*.

**6. Si vuestra aplicación tuviera 100.000 restaurantes, ¿cómo gestionaría el rendimiento el mapa?**
- **Respuesta:** *"Para una escala así, implementaríamos **Clustering** (agrupar puntos cercanos en un solo círculo con un número) y **Paginación Geográfica** (solo cargar los restaurantes que están dentro del área visible del mapa en ese momento). Actualmente, como es un MVP, cargamos todos los datos, pero la arquitectura está preparada para escalar"*.

**7. ¿Cómo recalculáis el rating del restaurante tras recibir una valoración y cómo evitáis el spam?**
- **Respuesta:** *"Para evitar valoraciones spam de un mismo usuario, definimos una restricción `UNIQUE` compuesta en la tabla `valoraciones` de PostgreSQL. Además, para recalcular la media de estrellas, realizamos la suma de las puntuaciones previas en la capa del backend, sacamos el promedio con un decimal y actualizamos el campo `rating` en la tabla `restaurantes` de forma inmediata. Así, la carga de visualización es instantánea para los futuros clientes"*.
