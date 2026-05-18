# 🔄 Guía de Flujos de Backend: Todo el Recorrido del Código

Esta guía explica, paso a paso y archivo a archivo, qué ocurre en el servidor cada vez que el usuario realiza una acción en Play & Eat. Incluye todos los caminos posibles: éxito, error y casos especiales.

---

## FLUJO 1: REGISTRO DE USUARIO

### ¿Qué ocurre cuando alguien rellena el formulario de registro y pulsa "Crear cuenta"?

**Archivos implicados (en orden de ejecución):**
1. `app/registro/page.tsx` → El formulario visual
2. `lib/supabase.ts` → El cliente de conexión
3. `app/api/auth/registro/route.ts` → El endpoint de la API
4. `lib/backend/controllers/authController.ts` → El controlador
5. `lib/backend/services/authService.ts` → El servicio (lógica real)
6. **Supabase** → La base de datos y el sistema de Auth

---

**Paso 1 — Validación en el Frontend** (`app/registro/page.tsx`, función `handleRegistro`)

Antes de enviar nada al servidor, el código hace una primera comprobación:
```
¿El usuario ha seleccionado un rol (Familia o Negocio)?
  → NO: muestra el error "Por favor, selecciona..." y se detiene aquí.
  → SÍ: continúa al paso 2.
```

**Paso 2 — Primera llamada: Supabase Auth** (directamente desde el frontend)

El formulario llama directamente a Supabase con `supabase.auth.signUp()` pasando:
- El email
- La contraseña (que Supabase cifra con bcrypt antes de guardar)
- Los datos extras en `user_metadata`: el nombre y el rol

```
¿Supabase devuelve error? (ej: email ya registrado, contraseña muy corta)
  → SÍ: muestra el mensaje de error en el formulario. Fin.
  → NO: continúa al paso 3.
```

**Paso 3 — Segunda llamada: nuestra API REST** (para crear el perfil en nuestra tabla)

Una vez Supabase ha creado el usuario en su sistema de Auth, el código llama a nuestra propia API:

```
POST /api/auth/registro
Body: { userId, nombre, rol }
```

Este paso crea una fila en nuestra tabla `perfiles` propia (no es la de Supabase, es la nuestra). Así tenemos control total sobre los datos del usuario.

**Paso 4 — El endpoint recibe la llamada** (`app/api/auth/registro/route.ts`)

Este archivo es solo un "distribuidor de tráfico". Recibe la petición POST y la delega inmediatamente:
```typescript
export async function POST(request: Request) {
  return AuthController.handleRegistro(request);
}
```

**Paso 5 — El controlador valida** (`authController.ts`, función `handleRegistro`)

El controlador comprueba si vienen los datos necesarios:
```
¿Viene un userId en el body?
  → SÍ: llama a AuthService.crearPerfil() y devuelve { message: 'Perfil creado con éxito' }
  → NO: comprueba si vienen email+password+nombre+rol
      → Faltan campos: devuelve error 400 (Bad Request)
      → Están todos: llama a AuthService.registrar()
```

**Paso 6 — El servicio ejecuta en la base de datos** (`authService.ts`)

- `AuthService.crearPerfil()`: Inserta en la tabla `perfiles` los datos `{ id: userId, nombre, rol }` usando `upsert` (inserta si no existe, actualiza si ya existe).
- `AuthService.registrar()`: Llama a `supabase.auth.signUp()` como fallback directo.

**Paso 7 — Redirección final** (de vuelta en `app/registro/page.tsx`)

```
¿Supabase ha devuelto una sesión activa?
  → SÍ, rol = 'familia': redirige a /perfil
  → SÍ, rol = 'negocio': redirige a /admin
  → NO (Supabase requiere confirmación de email): muestra aviso y redirige a /login
```

---

## FLUJO 2: INICIO DE SESIÓN (LOGIN)

### ¿Qué ocurre cuando alguien escribe su email y contraseña y pulsa "Entrar"?

**Archivos implicados:**
1. `app/login/page.tsx` → El formulario visual
2. `lib/supabase.ts` → El cliente de conexión
3. `lib/backend/services/authService.ts` → La lógica (aquí se usa directamente sin pasar por API)

---

**Paso 1 — El formulario envía los datos** (`app/login/page.tsx`, función `handleLogin`)

El formulario llama directamente a Supabase con `supabase.auth.signInWithPassword({ email, password })`.

**Nota técnica importante:** El login NO pasa por nuestra API REST (como sí hace el registro). En este caso se llama directamente desde el frontend a Supabase, porque el objetivo es obtener el token JWT de sesión, que el propio Supabase gestiona y almacena en el navegador.

```
¿Supabase devuelve error? (credenciales incorrectas, usuario no existe)
  → SÍ: muestra "Credenciales incorrectas o error al iniciar sesión."
  → NO: continúa al paso 2.
```

**Paso 2 — Lectura del rol desde el token**

Una vez el login es correcto, el código lee el rol del usuario desde `data.user.user_metadata?.rol`. Este dato está dentro del JWT, por lo que no necesita hacer ninguna consulta adicional a la base de datos.

**Paso 3 — Redirección por rol**

```
rol === 'negocio'  →  redirige a /admin
rol === 'familia' (o cualquier otro) → redirige a /perfil
```

---

## FLUJO 3: PROTECCIÓN DE RUTAS (Seguridad de Páginas Privadas)

### ¿Qué ocurre cuando alguien intenta entrar directamente a /perfil o /admin sin estar logueado?

**Archivos implicados:**
- `app/perfil/page.tsx`
- `app/admin/page.tsx` (y similares)

---

**Paso 1 — Al cargar la página, se ejecuta `useEffect`**

En cuanto la página se carga en el navegador, el código ejecuta automáticamente:
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

**Paso 2 — Comprobación de sesión**

```
¿Existe una sesión activa (hay un token JWT válido en el navegador)?
  → NO: redirige automáticamente a /login. El usuario nunca ve el contenido.
  → SÍ: continúa cargando los datos del perfil.
```

**Paso 3 — Comprobación de rol (para el panel de admin)**

```
¿El rol del usuario es 'negocio'?
  → NO (es 'familia'): redirige a /perfil aunque esté logueado.
  → SÍ: muestra el panel de administración.
```

---

## FLUJO 4: GESTIÓN DE RESTAURANTES

### 4A — Listar restaurantes (con o sin filtros)

**Archivos implicados:**
1. `app/buscar/page.tsx` o `components/FeaturedRestaurants.tsx`
2. `app/api/restaurantes/route.ts`
3. `lib/backend/controllers/restaurantController.ts`
4. `lib/backend/services/restaurantService.ts`

**El flujo:**
```
Usuario carga la página / aplica un filtro
    ↓
GET /api/restaurantes?ubicacion=X&comida=Y
    ↓
RestaurantController.handleGetRestaurants()
    ↓
RestaurantService.getRestaurants({ ubicacion, comida, entretenimiento })
    ↓
Construye la consulta en Supabase dinámicamente:
  - Si hay filtro de ubicación → .ilike('location', '%valor%')  [búsqueda parcial]
  - Si hay filtro de comida    → .eq('food_type', 'valor')     [coincidencia exacta]
  - Si hay filtro de servicio  → .contains('services', ['valor']) [busca en el array]
    ↓
Devuelve la lista de restaurantes como JSON
    ↓
El componente los renderiza como tarjetas RestaurantCard
```

**Si no hay filtros:** devuelve todos los restaurantes.
**Si falla la consulta:** el controlador captura el error y devuelve error 500.

---

### 4B — Ver el detalle de un restaurante

**Archivos implicados:**
1. `app/restaurantes/[id]/page.tsx`
2. `RestaurantService.getRestaurantById(id)`

```
Usuario pulsa en una tarjeta de restaurante
    ↓
Next.js navega a /restaurantes/[id] (el [id] es el UUID del restaurante)
    ↓
La página llama a RestaurantService.getRestaurantById(id)
    ↓
Supabase busca en la tabla 'restaurantes' donde id = el valor de la URL
    ↓
¿Lo encuentra?
  → NO: devuelve null → la página muestra "Restaurante no encontrado"
  → SÍ: muestra la ficha completa con foto, descripción, servicios y valoración
```

---

### 4C — Crear un restaurante nuevo (Panel de Negocio)

**Archivos implicados:**
1. `app/admin/page.tsx` (el formulario del panel)
2. `app/api/restaurantes/route.ts`
3. `lib/backend/controllers/restaurantController.ts`, función `handleCreateRestaurant`
4. `lib/backend/services/restaurantService.ts`, función `createRestaurant`

```
Dueño rellena el formulario (nombre, descripción, foto, servicios...)
    ↓
POST /api/restaurantes
Body: { name, description, location, lat, lng, imageUrl, foodType, services, ownerId }
    ↓
RestaurantController.handleCreateRestaurant()
    ↓
El servicio adapta los nombres de los campos al formato de la base de datos:
  imageUrl → image_url
  foodType → food_type
  lat / lng → se guardan como NUMERIC para el mapa
  ownerId  → owner_id (vincula el restaurante con el usuario que lo creó)
    ↓
Supabase inserta el nuevo restaurante en la tabla 'restaurantes'
    ↓
¿Error?
  → SÍ: devuelve error 500 con el mensaje
  → NO: devuelve los datos del restaurante creado (status 200)
```

---

## FLUJO 5: SISTEMA DE FAVORITOS

### 5A — Marcar/desmarcar un favorito (el corazón)

**Archivos implicados:**
1. `components/RestaurantCard.tsx`, función `toggleFavorite`
2. `lib/supabase.ts` (se usa directamente desde el componente)

```
Usuario pulsa el corazón en una tarjeta
    ↓
¿Hay sesión activa? (supabase.auth.getUser())
  → NO: muestra aviso "¡Inicia sesión para guardar!" y el corazón vibra
  → SÍ: continúa al siguiente paso
    ↓
Consulta en Supabase: ¿ya existe una fila en 'favoritos'
con este perfil_id Y este restaurante_id?
    ↓
¿Existe?
  → SÍ (ya era favorito): lo BORRA de la tabla → el corazón se pone gris
  → NO (no era favorito): lo INSERTA en la tabla → el corazón se pone rojo
```

### 5B — Ver la lista de favoritos en el panel

**Archivos implicados:**
1. `app/favoritos/page.tsx`

```
Usuario entra a /favoritos
    ↓
¿Hay sesión? → NO: redirige a /login
    ↓
Consulta con JOIN en Supabase:
  tabla 'favoritos' filtrada por perfil_id = usuario actual
  + datos del restaurante relacionado (nombre, foto, valoración, servicios)
    ↓
¿Hay favoritos?
  → NO: muestra pantalla "Aún no tienes favoritos" con botón para explorar
  → SÍ: renderiza las tarjetas RestaurantCard de cada restaurante guardado
```

---

## FLUJO 6: MAPA INTERACTIVO Y GEOLOCALIZACIÓN

### ¿Qué ocurre cuando el usuario entra en la sección "Mapa Interactivo"?

**Archivos implicados:**
1. `app/mapa/page.tsx` → Página principal (Server Component)
2. `lib/backend/services/restaurantService.ts` → Capa de datos
3. `components/MapWrapper.tsx` → Envoltorio de cliente (para evitar errores de SSR)
4. `components/RestaurantsMap.tsx` → El mapa real (Leaflet)

---

**Paso 1 — Carga de datos en el servidor** (`app/mapa/page.tsx`)

Al ser una página de Next.js, lo primero que ocurre es que el servidor ejecuta la función `MapaPage()`:
```typescript
const restaurantes = await RestaurantService.getRestaurants();
```
Esto descarga todos los restaurantes (incluyendo sus campos `lat` y `lng`) antes de que la página llegue al navegador del usuario.

**Paso 2 — El Wrapper de Cliente** (`components/MapWrapper.tsx`)

Como los mapas interactivos (Leaflet) necesitan el objeto `window` del navegador para funcionar, no se pueden renderizar en el servidor. 
- Usamos `dynamic(() => import(...), { ssr: false })` dentro del `MapWrapper`.
- Esto le dice a Next.js: "No intentes pintar el mapa en el servidor, espera a que el usuario tenga la página abierta en su navegador".

**Paso 3 — Renderizado y Filtrado** (`components/RestaurantsMap.tsx`)

Una vez en el navegador del usuario:
1. El componente recibe la lista de `restaurantes`.
2. **Filtrado de seguridad**: Se eliminan de la lista aquellos que no tengan coordenadas (`lat` o `lng`) para evitar errores visuales.
3. **Pintado de Marcadores**: Se recorre la lista y se dibuja un `<Marker>` (pin naranja) en cada coordenada.
4. **Interactividad**: Al pinchar en un marcador, se abre un `<Popup>` que extrae los datos (nombre, foto) del objeto restaurante y permite navegar a su ficha.


---

## FLUJO 7: SISTEMA DE VALORACIONES (Reseñas y Estrellas)

### ¿Qué ocurre cuando una familia califica un restaurante con estrellas y un comentario?

**Archivos implicados (en orden de ejecución):**
1. `components/RestaurantReviews.tsx` → El formulario y lista en el frontend (Client Component)
2. `app/api/valoraciones/route.ts` → El endpoint receptor
3. `lib/backend/controllers/valoracionController.ts` → El controlador (valida sesión y datos)
4. `lib/backend/services/valoracionService.ts` → El servicio (guarda y recalcula promedio)
5. **Supabase** → Base de datos (tabla `valoraciones` y actualización en `restaurantes`)

---

**Paso 1 — El usuario interactúa en la pantalla** (`RestaurantReviews.tsx`)
- Al estar logueado como "familia", se le muestra el formulario de 1 a 5 estrellas y un campo de texto.
- Selecciona las estrellas (que cambian de color visualmente) y escribe un comentario.
- Al pulsar "Publicar valoración", se ejecuta la función `handleSubmit`.

**Paso 2 — Llamada HTTP POST a nuestra API REST**
Se realiza una petición asíncrona:
```typescript
POST /api/valoraciones
Body: { restauranteId, puntuacion, comentario }
```

**Paso 3 — Mapeo de la ruta** (`app/api/valoraciones/route.ts`)
Next.js detecta el método `POST` y redirige la petición al controlador:
```typescript
export async function POST(request: Request) {
  return ValoracionController.handleCreateValoracion(request);
}
```

**Paso 4 — El Controlador valida las reglas de negocio** (`valoracionController.ts`)
- Comprueba que el usuario está logueado a través del token de Supabase.
- Valida que la puntuación esté estrictamente entre 1 y 5.
- Si todo es correcto, llama al método del servicio: `ValoracionService.crearValoracion(...)`.

**Paso 5 — El Servicio aplica la persistencia y actualiza el promedio** (`valoracionService.ts`)
1. **Inserción:** Guarda la nueva opinión en la tabla `valoraciones` relacionando el `perfil_id` del usuario y el `restaurante_id`.
2. **Cálculo de la media:** Consulta todas las valoraciones asociadas a ese restaurante específico.
3. **Fórmula:** Suma todas las puntuaciones y las divide por el número total de reseñas para hallar el promedio aritmético exacto (con 1 decimal).
4. **Actualización:** Hace un `UPDATE` en la tabla `restaurantes` actualizando la columna `rating` con la nueva media calculada.

**Paso 6 — Recarga de interfaz** (`RestaurantReviews.tsx`)
- Se muestra un mensaje de éxito.
- Tras 1.5 segundos, se recarga la página para que la ficha principal del restaurante muestre el promedio de estrellas actualizado.

---

## RESUMEN: Mapa de todos los flujos

```
REGISTRO          →  registro/page → supabase.auth.signUp + POST /api/auth/registro
                      → authController → authService.crearPerfil → tabla 'perfiles'

LOGIN             →  login/page → supabase.auth.signInWithPassword
                      → lee rol del token JWT → redirige a /perfil o /admin

PROTECCIÓN RUTA   →  cualquier página privada → getSession() → ¿sesión? → redirect /login

VER RESTAURANTES  →  buscar/page → GET /api/restaurantes → restaurantController
                      → restaurantService.getRestaurants(filtros) → tabla 'restaurantes'

VER DETALLE       →  restaurantes/[id] → restaurantService.getRestaurantById(id)

CREAR RESTAURANTE →  admin/page → POST /api/restaurantes → restaurantController
                      → restaurantService.createRestaurant → tabla 'restaurantes'

FAVORITOS (TOGGLE)→  RestaurantCard → getUser() → consulta tabla 'favoritos'
                      → ¿existe? BORRA : INSERTA

VER FAVORITOS     →  favoritos/page → tabla 'favoritos' JOIN tabla 'restaurantes'

VALORACIONES      →  RestaurantReviews → POST /api/valoraciones → valoracionController
                      → valoracionService.crearValoracion → tabla 'valoraciones'
                      → Recalcula media y actualiza rating de 'restaurantes'
```

