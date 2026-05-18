# 🏗️ Arquitectura Detallada del Proyecto: Play & Eat

Este documento describe la estructura completa del proyecto, explicando la función de cada carpeta y archivo. Esta organización profesional garantiza que el código sea fácil de mantener, seguro y escalable.

---

## 📂 Mapa Completo de Archivos

```text
TFG-PLAYANDEAT/
├── 📂 app/                      # 🏠 RUTAS Y PÁGINAS (App Router)
│   ├── 📂 admin/                # 🛠️ Panel de control para Dueños de Negocio
│   │   └── 📄 page.tsx          # Vista principal del panel de administración
│   ├── 📂 api/                  # 🔌 BACKEND INTERNO (Rutas de la API)
│   │   ├── 📂 auth/             # Endpoints de autenticación
│   │   │   └── 📂 registro/
│   │   │       └── 📄 route.ts  # Procesa el alta de nuevos usuarios
│   │   ├── 📂 favoritos/
│   │   │   └── 📄 route.ts      # Gestiona guardar/borrar favoritos
│   │   ├── 📂 restaurantes/
│   │   │   ├── 📄 route.ts      # Listar todos o crear uno nuevo
│   │   │   └── 📂 [id]/
│   │   │       └── 📄 route.ts  # Obtener datos de un restaurante específico
│   │   └── 📂 valoraciones/
│   │       └── 📄 route.ts      # Gestiona la creación y lectura de valoraciones [NUEVO]
│   ├── 📂 buscar/               # 🔍 Buscador general de restaurantes
│   │   └── 📄 page.tsx          # Página de búsqueda con filtros
│   ├── 📂 favoritos/            # ❤️ Lista de deseos del usuario
│   │   └── 📄 page.tsx          # Vista de los restaurantes guardados
│   ├── 📂 login/                # 🔑 Acceso de usuarios
│   │   └── 📄 page.tsx          # Formulario de inicio de sesión
│   ├── 📂 mapa/                 # 🗺️ SECCIÓN DE MAPA INTERACTIVO
│   │   └── 📄 page.tsx          # Página principal del mapa (Server Component)
│   ├── 📂 perfil/               # 👤 Área privada del usuario familia
│   │   └── 📄 page.tsx          # Perfil y ajustes
│   ├── 📂 registro/             # 📝 Alta de nuevos usuarios
│   │   └── 📄 page.tsx          # Formulario de registro (Familia/Negocio)
│   ├── 📂 restaurantes/         # 📄 Fichas individuales
│   │   └── 📂 [id]/
│   │       └── 📄 page.tsx      # Detalle dinámico que integra el componente de valoraciones
│   ├── 📄 globals.css           # 🎨 Estilos globales y variables de Tailwind
│   ├── 📄 layout.tsx            # 🖼️ Estructura base (Header/Footer en todas las páginas)
│   └── 📄 page.tsx              # 🏠 Landing Page (Página de Inicio)
│
├── 📂 components/               # 🧩 COMPONENTES UI (Piezas reutilizables)
│   ├── 📄 Header.tsx            # Barra de navegación inteligente
│   ├── 📄 HeroBanner.tsx        # Cabecera con buscador de la Home
│   ├── 📄 MapPromo.tsx          # Banner promocional del mapa
│   ├── 📄 MapWrapper.tsx        # Envoltorio para cargar el mapa de forma segura
│   ├── 📄 RestaurantCard.tsx    # Tarjeta visual de cada restaurante
│   ├── 📄 RestaurantsMap.tsx    # Lógica real del mapa de Leaflet
│   ├── 📄 CategoryNav.tsx       # Botones de categorías (Brunch, Cena...)
│   └── 📄 RestaurantReviews.tsx # Sistema visual de estrellas y comentarios [NUEVO]
│
├── 📂 lib/                      # 🧠 EL CEREBRO DEL SISTEMA
│   ├── 📄 supabase.ts           # ☁️ Configuración y cliente de conexión a Supabase
│   └── 📂 backend/              # ⚙️ LÓGICA DE SERVIDOR
│       ├── 📂 controllers/      # 👔 CAPA DE CONTROLADORES (Validación)
│       │   ├── 📄 authController.ts       # Lógica de registro
│       │   ├── 📄 favoriteController.ts   # Lógica de favoritos
│       │   ├── 📄 restaurantController.ts # Lógica de locales y coordenadas
│       │   └── 📄 valoracionController.ts # Valida sesión y datos de las opiniones [NUEVO]
│       └── 📂 services/         # 🍳 CAPA DE SERVICIOS (Acceso a Datos)
│           ├── 📄 authService.ts          # Comunicación con Supabase Auth
│           ├── 📄 favoriteService.ts      # Consultas a la tabla 'favoritos'
│           ├── 📄 restaurantService.ts    # Consultas a la tabla 'restaurantes'
│           └── 📄 valoracionService.ts    # Guarda valoraciones y recalcula rating medio [NUEVO]
│
├── 📂 public/                   # 🖼️ ARCHIVOS ESTÁTICOS (Logos, iconos)
├── 📂 styles/                   # 🎨 ARCHIVOS DE ESTILO ADICIONALES
├── 📄 .env.local                # 🔑 Variables de entorno (Claves privadas de la BBDD)
├── 📄 next.config.ts            # ⚙️ Configuración del framework Next.js
├── 📄 tailwind.config.ts        # 🎨 Configuración del diseño (colores, fuentes)
├── 📄 tsconfig.json             # 📝 Configuración de TypeScript
└── 📄 package.json              # 📦 Listado de librerías y scripts de ejecución
```

---

## ❓ ¿Por qué se ha organizado así?

La arquitectura de este proyecto no es aleatoria; responde a tres razones fundamentales:

### 1. Convención de Next.js (App Router)
La carpeta **`/app`** sigue estrictamente la convención de Next.js. El hecho de que cada carpeta sea una URL y que usemos archivos específicos (`page.tsx`, `layout.tsx`, `route.ts`) es lo que permite que el proyecto sea rápido, tenga buen SEO y gestione el backend y el frontend en un solo lugar.

### 2. Patrón de Diseño "Controller-Service"
Hemos decidido separar la lógica de **`/lib/backend`** por capas para imitar cómo trabajan las empresas de software profesionales:
- **Controllers:** Se encargan de la "web" (recibir peticiones HTTP, enviar códigos de error, validar la existencia de datos y la sesión del usuario).
- **Services:** Se encargan de la "información" y base de datos (conectar con Supabase, hacer consultas SQL e inserciones). Por ejemplo, al guardar una reseña en `valoracionService.ts`, este se encarga además de sumar las notas previas y recalcular la media del restaurante.
- **¿Por qué?** Porque si el día de mañana queremos cambiar Supabase por otra base de datos, **solo tendríamos que tocar la carpeta de Services**. El resto de la web seguiría funcionando igual.

### 3. Componentización (Modularidad)
En la carpeta **`/components`**, cada archivo es independiente. Por ejemplo, el `Header.tsx` o la `RestaurantCard.tsx` se pueden usar en cualquier página sin tener que copiar y pegar código. Esto se hace por **mantenibilidad**: si quieres cambiar el color de todos los botones de la web, solo lo cambias en un sitio. Con la inclusión de `RestaurantReviews.tsx`, modularizamos el área de feedback sin ensuciar la ficha detallada del local.

---

## 💡 Resumen Final
Esta organización garantiza un **"Separation of Concerns"** (Separación de Responsabilidades). Cada archivo tiene una sola misión clara, lo que evita el código "espagueti" y facilita enormemente que cualquier programador (o profesor) pueda entender el proyecto en pocos minutos. 🚀🤖
