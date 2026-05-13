# 🎓 Guía de Defensa: Arquitectura del Backend

Esta guía está diseñada para que entiendas perfectamente cómo está construido el backend de tu TFG y sepas responder a las preguntas del tribunal. 

El profesor pidió expresamente: *"Usar Supabase como base de datos, pero implementando vosotros la lógica del backend (API REST, controladores, servicios, seguridad, etc.)"*. **Aquí te explico cómo lo hemos cumplido al 100%.**

---

## 1. API REST (Los Endpoints)
**¿Qué es?** Son las "puertas" de tu servidor. Cuando el navegador del usuario quiere guardar algo o pedir datos, no va directamente a la base de datos (eso sería inseguro), sino que llama a la puerta de la API REST.

**¿Dónde está en tu proyecto?**
Toda la API REST está en la carpeta `app/api/`. Cada subcarpeta tiene un archivo `route.ts`.
*   **Ejemplo para enseñar:** Abre `app/api/auth/registro/route.ts` o `app/api/favoritos/route.ts`.
*   **¿Qué hace?** Recibe la petición HTTP (un `POST` o un `GET`), extrae los datos que manda el usuario (ej. su email y contraseña) y se los pasa al Controlador.

**Si el profesor pregunta:** *"Enséñame un endpoint de vuestra API REST"*.
**Tu respuesta:** "Por supuesto. Si vamos a `app/api/favoritos/route.ts`, podemos ver cómo recibimos la petición POST del cliente, comprobamos que el usuario tiene sesión, extraemos el `restaurantId` y llamamos a nuestro servicio para guardar el favorito."

---

## 2. Los Controladores (Controllers)
**¿Qué son?** Son los "jefes de planta". Reciben los datos crudos de la API REST, comprueban que no falte nada (validación) y deciden a qué servicio llamar. Ellos no hablan con la base de datos, solo dirigen el tráfico.

**¿Dónde están?**
En la carpeta `lib/backend/controllers/`.
*   **Ejemplo para enseñar:** Abre `lib/backend/controllers/authController.ts`.
*   **¿Qué hace?** Si te fijas en la función `handleRegistro`, primero comprueba que vengan todos los campos (`email`, `password`, `nombre`, `rol`). Si falta algo, devuelve un error 400 (Bad Request). Si todo está bien, llama al `AuthService`.

**Si el profesor pregunta:** *"¿Para qué usáis los controladores?"*.
**Tu respuesta:** "Los utilizamos para separar responsabilidades siguiendo el patrón de diseño *Controller-Service*. El controlador actúa como intermediario: valida los datos de entrada que llegan de la API y maneja los errores, dejando la lógica de negocio pura para la capa de Servicios."

---

## 3. Los Servicios (Services)
**¿Qué son?** Son los "operarios especializados". Son los únicos que tienen permiso para hablar directamente con Supabase (la base de datos). 

**¿Dónde están?**
En la carpeta `lib/backend/services/`.
*   **Ejemplo para enseñar:** Abre `lib/backend/services/favoriteService.ts` o `authService.ts`.
*   **¿Qué hace?** Tienen funciones como `.insert()` o `.select()`. Ellos escriben y leen en las tablas reales de la base de datos.

**Si el profesor pregunta:** *"Habéis dicho que Supabase es solo vuestra base de datos, ¿dónde está la lógica de negocio?"*.
**Tu respuesta:** "Toda nuestra lógica de negocio reside en los Servicios. Por ejemplo, en el archivo `authService.ts` no solo creamos el usuario en el sistema de Auth, sino que tenemos lógica propia para insertar automáticamente a ese usuario en nuestra tabla personalizada de `perfiles` y asignarle un rol (Familia o Negocio). Esa orquestación la hemos programado nosotros, Supabase solo guarda los datos."

---

## 4. La Seguridad
**¿Qué es?** Son todas las barreras que hemos puesto para que un usuario normal no pueda borrar restaurantes o ver datos que no son suyos.

**¿Dónde está la seguridad implementada?**
La hemos aplicado en tres capas distintas:

1.  **Seguridad en el Backend (Middleware/API):**
    *   Si vas a `app/api/favoritos/route.ts`, verás la línea `if (!user) { return NextResponse.json({ error: 'No autorizado' }, { status: 401 }); }`. Esto impide que un atacante guarde favoritos sin estar logueado.
2.  **Seguridad en Rutas (Frontend):**
    *   En archivos como `app/perfil/page.tsx`, si un usuario que es "Familia" intenta entrar al panel de "Negocios" (`/admin`), el código lee su `rol` y lo redirige. Hemos programado el control de acceso basado en roles (RBAC).
3.  **Seguridad a Nivel de Fila (RLS) en Supabase:**
    *   Hemos activado "Row Level Security". Hemos escrito reglas SQL que dicen: *"Un usuario solo puede ver y borrar las filas de favoritos donde el perfil_id coincida con su propio ID"*. Esto significa que aunque un hacker descubriera nuestra API, la base de datos repelería el ataque desde el nivel más profundo.

**Si el profesor pregunta:** *"¿Cómo habéis protegido la aplicación?"*.
**Tu respuesta:** "Aplicamos seguridad en múltiples capas. En el lado del servidor de Next.js, nuestras rutas de API verifican la sesión y rechazan peticiones no autorizadas (error 401). Además, hemos implementado control de acceso por roles en el frontend para proteger los paneles de administración, y finalmente configuramos políticas RLS en la base de datos para garantizar que ningún usuario pueda alterar datos ajenos."

---

### Resumen Visual de vuestra Arquitectura para la defensa:

**Cliente (Navegador)** ➡️ Hace click ➡️ **API REST (app/api/)** ➡️ Llama a ➡️ **Controller (lib/backend/controllers/)** ➡️ Valida y llama a ➡️ **Service (lib/backend/services/)** ➡️ Ejecuta la operación en ➡️ **Supabase (Base de Datos)**.
