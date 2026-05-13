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

---

## 2. Estructura de Archivos (Arquitectura Profesional)

### **Carpeta `/app/api` (Los Cables/Interfaces)**
Son los puntos de entrada. No contienen lógica compleja, solo pasan la "pelota" a los controladores.
*   `app/api/auth/...`: Rutas para registro y perfil.
*   `app/api/restaurantes/...`: Rutas para gestionar los negocios.

### **Carpeta `/lib` (El Cerebro)**
*   **`lib/supabase.ts`**: Inicializa el "mando a distancia" (cliente) para hablar con la base de datos.
*   **`/lib/backend/controllers`**: Reciben la petición de la API, validan que los datos estén bien y responden al usuario usando **`NextResponse`**.
*   **`/lib/backend/services`**: Son los que realmente hacen el trabajo pesado con la base de datos.

---

## 3. Arquitectura en Capas: El Patrón Restaurante

Hemos separado el código en capas para cumplir con estándares profesionales de ingeniería:

1.  **Frontend:** El cliente pide.
2.  **API Route:** El timbre de la cocina.
3.  **Controller:** El camarero que valida el pedido y responde con **NextResponse**.
4.  **Service:** El cocinero que prepara los datos consultando la despensa (Supabase).

**¿Por qué lo hacemos así?** 
Para que el código sea **desacoplado**. Si cambiamos la base de datos, solo tocamos la capa de *Service*. Si cambiamos la web por una app móvil, el *Backend* (Controllers y Services) sigue sirviendo igual.

---

## 4. Conceptos Clave para la Defensa

*   **`NextResponse`**: Herramienta de Next.js necesaria para que el servidor envíe respuestas (OK 200, Error 500) al navegador.
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
1.  **Table Editor:** Para ver y editar las tablas (`restaurantes`, `perfiles`). Es como un Excel de tu base de datos.
2.  **Storage:** Donde se guardan físicamente las fotos que suben los dueños de negocios.
3.  **Authentication:** Donde puedes ver la lista de emails registrados y sus IDs únicos (UUID).

**Sobre los Scripts SQL:**
La estructura de estas tablas no apareció por arte de magia. Se crearon ejecutando **Scripts SQL** en la consola de Supabase. Estos scripts definen:
*   El **Esquema**: Qué columnas tiene cada tabla y de qué tipo son (Texto, Números, Fechas).
*   Las **Relaciones**: Por ejemplo, que un restaurante "pertenece" a un `owner_id`.
*   Las **Políticas**: Quién puede leer o escribir datos.
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

### **B. Las Páginas (`/app`)**
Las páginas son los archivos que definen las direcciones URL de nuestra web:
*   **`page.tsx` (Home)**: Es la página de inicio. Su única función es **importar y ordenar** los componentes que hemos visto arriba.
*   **`app/restaurantes/[id]/page.tsx`**: Es la página de detalle. Usa el ID de la URL para pedir al servidor la información de UN solo restaurante y mostrarla en pantalla grande.
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
*   **`api/restaurantes`**: Tiene dos funciones: devolver la lista de todos los restaurantes (GET) o guardar uno nuevo (POST).
*   **`api/restaurantes/[id]`**: Sirve para pedir los datos de un restaurante concreto usando su ID.

### **B. Los Controladores (`/lib/backend/controllers`)**
Son los "cerebros" intermedios. Su trabajo es validar que los datos sean correctos antes de enviarlos a la base de datos:
*   **`authController.ts`**: Comprueba que el registro de usuario tenga email, nombre y rol. Si falta algo, devuelve un error 400.
*   **`restaurantController.ts`**: Se encarga de procesar la creación de nuevos restaurantes, asegurándose de que la imagen y el dueño estén bien asignados.

### **C. Los Servicios (`/lib/backend/services`)**
Son los que realmente "tocan" Supabase. No saben nada de internet, solo de bases de datos:
*   **`authService.ts`**: Contiene la lógica para crear el perfil en la tabla `perfiles` y gestionar el login.
*   **`restaurantService.ts`**: Es el encargado de hacer los `SELECT` (leer) y los `INSERT` (escribir) en la tabla de restaurantes. También incluye los filtros de búsqueda (por ubicación, tipo de comida, etc.).

### **¿Cómo viaja la información? (Flujo de ejemplo)**
Cuando un dueño registra un restaurante:
1.  **Frontend:** El formulario envía los datos a `/api/restaurantes`.
2.  **API Route:** Recibe la llamada y ejecuta el `restaurantController`.
3.  **Controller:** Mira si el nombre del restaurante no está vacío. Si está OK, llama al `restaurantService`.
4.  **Service:** Lanza el comando `insert` a Supabase.
5.  **Resultado:** El Service devuelve el éxito al Controller, el Controller al API Route, y la API Route le dice al Frontend: *"¡Hecho!"*.

---

## 9. Guía de Instalación y Ejecución Local

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
