# 🔐 Guía de Seguridad y Supabase: Todo lo que Necesitas Saber

Esta guía recoge en detalle todo lo relacionado con la seguridad de la autenticación en Play & Eat: cómo se cifran las contraseñas, qué es y para qué sirve JWT, qué parte del backend habéis implementado vosotros y qué hace Supabase realmente.

---

## 1. La Pregunta del Profesor: ¿Texto Plano o Cifrada?

### ¿Qué significa "texto plano"?

Imagina que el usuario escribe la contraseña `MiFamilia2024`. Si se guardara en **texto plano**, en la base de datos existiría exactamente eso: la palabra `MiFamilia2024` que cualquiera podría leer. Es como guardar las llaves de casa en la cerradura por fuera. Una vulnerabilidad gravísima.

### ¿Qué significa "cifrada" o "hasheada"?

En lugar de guardar la contraseña original, se pasa por un **algoritmo matemático** que la convierte en una cadena de texto irreconocible e **irreversible**. Por ejemplo:

```
MiFamilia2024  →  $2b$12$K8Yw3NxJ4pQzT7mL9vA1uOGhRsFdWeB6nCcXiMoEjDZlP0aHrVqI
```

Esa cadena larga es el **hash**. Nadie puede convertirla de vuelta a `MiFamilia2024`. Ni vosotros, ni Supabase, ni nadie.

### ¿Cómo funciona entonces el login si no se puede revertir?

Cuando el usuario hace login, no se "descifra" la contraseña. En su lugar:
1. El usuario escribe `MiFamilia2024`.
2. El sistema aplica el mismo algoritmo a esa contraseña nueva.
3. Compara los dos hashes. Si coinciden → acceso concedido.

**Nunca se compara la contraseña en texto plano. Solo se comparan hashes.**

---

## 2. El Algoritmo: bcrypt

El algoritmo que usa Supabase para cifrar las contraseñas se llama **bcrypt**. Sus características más importantes son:

- **Unidireccional:** No existe forma matemática de revertirlo. Solo se puede verificar.
- **"Salted":** Antes de hacer el hash, añade datos aleatorios (llamados "salt") a la contraseña. Esto hace que dos usuarios con la misma contraseña tengan hashes completamente diferentes, protegiendo contra ataques de diccionario.
- **Lento por diseño:** A diferencia de otros algoritmos rápidos (como MD5), bcrypt está diseñado para ser computacionalmente lento. Esto hace que los ataques de fuerza bruta (probar millones de contraseñas) sean inviables en la práctica.

### ¿Dónde ocurre esto en vuestro proyecto?

En el archivo **`lib/backend/services/authService.ts`**. La línea clave es:

```typescript
supabase.auth.signUp({ email, password, options: { data: { nombre, rol } } })
```

En el momento en que se ejecuta esa línea, vosotros le pasáis la contraseña a Supabase y **Supabase aplica bcrypt internamente** antes de guardar nada. La contraseña en texto plano nunca toca la base de datos.

### ¿Cómo verificarlo visualmente?

1. Abre el panel de Supabase de vuestro proyecto.
2. Ve a **Authentication → Users**.
3. Haz clic en cualquier usuario registrado.
4. Verás su email, su ID (UUID) y su fecha de registro, pero **el campo de contraseña directamente no existe**. Esa es la prueba definitiva.

---

## 3. JWT: El "Pase de Visitante" de Vuestra App

### ¿Qué es un JWT?

JWT son las siglas de **JSON Web Token**. Es un estándar de la industria para gestionar sesiones de usuario de forma segura. Para entenderlo, usa esta analogía:

> Imagina que entras a un edificio de oficinas. El guardia de la entrada te pide el DNI, comprueba que eres quien dices ser y te da un **pase de visitante** con tu nombre y a qué plantas puedes acceder. A partir de ese momento, ya no enseñas el DNI en cada puerta: enseñas el pase.

**El JWT es ese pase.** Una vez que el usuario hace login correctamente, el servidor genera un token que contiene:
- El ID del usuario.
- Su email.
- Su rol (familia o negocio).
- Una fecha de caducidad (cuándo expira la sesión).

Todo eso va **cifrado y firmado** en una sola cadena de texto que se guarda en el navegador del usuario.

### ¿Para qué sirve exactamente?

Sin JWT, el usuario tendría que enviar su email y contraseña **en cada petición** que hace al servidor. Con JWT:
1. El usuario hace login una vez → el servidor genera el token.
2. El token se guarda en el navegador.
3. En cada petición posterior, el navegador envía el token automáticamente.
4. El servidor lee el token, extrae la información del usuario y sabe quién es, **sin consultar la base de datos cada vez**.

Esto es más eficiente, más seguro y es el estándar en todas las aplicaciones web modernas.

### ¿Lo habéis implementado vosotros?

La **generación del token** la hace Supabase automáticamente al llamar a `signInWithPassword()`. Pero la **lógica que usa ese token** sí la habéis implementado vosotros:

- Leer el rol del token → decidir si redirigir a `/perfil` o `/admin`.
- Comprobar si el token existe → bloquear el acceso a páginas privadas si no hay sesión.
- Usar el token para identificar al usuario en las peticiones a vuestra API.

---

## 4. ¿Qué Habéis Implementado Vosotros vs. Qué Hace Supabase?

Esta tabla es fundamental para la defensa. Deja muy claro que vosotros no os habéis limitado a "pulsar un botón":

| Qué hace Supabase automáticamente | Qué habéis implementado vosotros |
| :--- | :--- |
| Cifrar la contraseña con bcrypt | La API Route `/api/auth/registro` que recibe la petición HTTP |
| Guardar el email en su sistema de Auth | El `authController.ts` que valida que vengan todos los campos obligatorios |
| Generar el token JWT de sesión | El `authService.ts` que llama a Supabase Y además crea el perfil en vuestra tabla propia |
| Verificar el token en cada petición | El **sistema de roles** guardado en `user_metadata` (familia/negocio) |
| | La **redirección por rol** en el login (familia → `/perfil`, negocio → `/admin`) |
| | La **protección de rutas** que comprueba la sesión antes de mostrar páginas privadas |
| | Las **políticas RLS** escritas en SQL que protegen los datos a nivel de base de datos |

**Conclusión:** Supabase actúa como una librería de seguridad de confianza (como usar `bcrypt` de npm). Vosotros habéis construido toda la lógica de negocio, el flujo y la arquitectura encima de ella.

---

## 5. Qué es Supabase Realmente (No Es Solo una Base de Datos)

Esta es una pregunta muy importante. Supabase se define como un **BaaS (Backend as a Service)**, es decir, un servicio que proporciona múltiples funcionalidades de backend listas para usar. En vuestro proyecto, usáis tres de sus módulos:

### Módulo 1: Base de Datos (PostgreSQL)
El más evidente. Supabase proporciona una base de datos relacional **PostgreSQL** en la nube con:
- **Table Editor:** Un panel visual para ver y editar datos como si fuera Excel.
- **SQL Editor:** Para ejecutar consultas SQL directamente.
- **Row Level Security (RLS):** Reglas de seguridad a nivel de fila. Por ejemplo, la regla que habéis configurado que dice "un usuario solo puede ver sus propios favoritos".

### Módulo 2: Autenticación (Auth)
Un sistema completo de gestión de identidad que incluye:
- Registro de usuarios con email y contraseña (con bcrypt automático).
- Login y generación de tokens JWT.
- Gestión de sesiones (cuándo caduca el token).
- Almacenamiento de metadatos del usuario (`user_metadata`), donde guardáis el rol y el nombre.
- Panel visual en **Authentication → Users** para ver todos los usuarios registrados.

### Módulo 3: Almacenamiento de Archivos (Storage)
Un sistema de almacenamiento de archivos en la nube similar a Amazon S3. Es donde se guardan físicamente las **fotos de los restaurantes** que suben los dueños de negocios. Cada imagen sube a un bucket llamado `restaurantes` y genera una URL pública que se guarda en la tabla de la base de datos.

### ¿Por qué se eligió Supabase y no hacerlo todo "a mano"?

Implementar desde cero un sistema de autenticación seguro con bcrypt, gestión de tokens JWT, renovación de sesiones, almacenamiento de archivos en servidor propio y una base de datos PostgreSQL requeriría semanas de trabajo adicional y un nivel de experiencia muy avanzado. Usar Supabase permite:
1. Centrarse en la **lógica de negocio propia** (controladores, servicios, flujos de usuario).
2. Garantizar que la parte de seguridad sigue los **estándares de la industria** (algo que un desarrollador junior podría no implementar correctamente a mano).
3. Reducir el tiempo de desarrollo sin sacrificar la seguridad ni la robustez.

Es exactamente el mismo razonamiento por el que una empresa usa Stripe para pagos en lugar de implementar su propio sistema de cobro: no porque no sepa programar, sino porque es más seguro y eficiente delegar esa responsabilidad crítica en un especialista.

---

## 6. Respuestas Preparadas para la Defensa

**P: ¿La contraseña se guarda en texto plano?**
> "No. Supabase aplica el algoritmo bcrypt antes de persistir la contraseña. Es un hash unidireccional, por lo que ni nosotros ni Supabase podemos recuperar la contraseña original. Solo es posible verificarla comparando hashes."

**P: ¿Habéis implementado JWT?**
> "La generación del token la realiza Supabase tras el login. Pero nosotros hemos implementado toda la lógica que consume ese token: la lectura del rol para redirigir al usuario al panel correcto, la protección de rutas privadas comprobando si existe sesión activa, y la identificación del usuario en las peticiones a nuestra API REST."

**P: ¿Supabase no hace todo el trabajo?**
> "Supabase actúa como una librería de infraestructura, igual que un desarrollador usa bcrypt de npm para el cifrado sin implementar el algoritmo él mismo. Toda la lógica de negocio, los controladores, los servicios, el sistema de roles, la API REST y las políticas de seguridad las hemos diseñado e implementado nosotros."
