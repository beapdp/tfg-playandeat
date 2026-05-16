# 📝 Guía Técnica del Formulario de Registro

Este documento explica en detalle el funcionamiento interno del componente visual del registro (`app/registro/page.tsx`). Es fundamental entender esto para la defensa, ya que demuestra tu conocimiento sobre cómo interactúa el usuario con la aplicación antes de que los datos lleguen al backend.

---

## 1. Importaciones Clave (Lo que traemos de fuera)

Al principio del archivo importamos varias herramientas:

- **`useRouter` (de `next/navigation`)**: Es un "Hook" (función especial) de Next.js. Nos permite redirigir al usuario a otra página (por ejemplo, a `/login` o `/perfil`) escribiendo código, sin que el usuario tenga que hacer clic en un enlace.
- **`<Link>` (de `next/link`)**: Es el componente oficial de Next.js para enlaces. A diferencia de la etiqueta `<a>` tradicional de HTML, `<Link>` carga la nueva página de forma instantánea sin que el navegador haga el típico parpadeo de recarga en blanco.
- **`Users`, `Store` (de `lucide-react`)**: Son simplemente los iconos que dibujan las familias y las tiendas en los botones de elegir rol.

---

## 2. El Concepto de "Estado" en React (`useState`)

Verás varias líneas como esta:
```typescript
const [email, setEmail] = useState('');
const [error, setError] = useState('');
```

**¿Qué significa esto?**
En React, las variables normales se borran cuando la pantalla cambia. Para crear variables "con memoria" (que recuerden lo que el usuario ha escrito), usamos `useState`.
- `email`: Es el valor actual.
- `setEmail`: Es la única función autorizada para cambiar ese valor.
- `('')`: Es el valor inicial (vacío).

**Cómo explicarlo:** *"Para gestionar los datos que el usuario introduce en tiempo real, utilizamos el hook `useState` de React, lo que nos permite mantener sincronizada la interfaz visual con los datos del formulario de manera reactiva."*

---

## 3. La Función de Envío: `handleRegistro`

```typescript
const handleRegistro = async (e: React.FormEvent) => {
  e.preventDefault();
```

- **`async`**: Indica que esta función va a hacer pausas para esperar respuestas de internet (con `await`).
- **`React.FormEvent`**: Es solo un tipo de TypeScript para avisar al editor de que la `e` es un evento de formulario. Si aparece tachado en el editor de código (VSCode), es simplemente un pequeño bug visual del propio editor al leer TypeScript, no es un error de tu código.
- **`e.preventDefault()`**: Es vital. Cancela el comportamiento por defecto de los formularios en HTML (que es recargar la página entera). Al evitar la recarga, podemos validar y enviar datos a Supabase en segundo plano, dando una experiencia fluida.

---

## 4. Validaciones Frontend (Antes del Servidor)

Antes de gastar tiempo conectando a la base de datos, hacemos filtros rápidos:

1. **Selección de rol**: `if (!rol) return;` (frena todo si no han elegido).
2. **Contraseñas idénticas**: `if (password !== confirmPassword) return;`
3. **Fortaleza (Regex)**: `const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;`

**El método `.test()`:**
Es una función exclusiva nativa de JavaScript para objetos de tipo Expresión Regular. Le pasas un texto, y devuelve `true` o `false` dependiendo de si cumple el patrón. `!passwordRegex.test(password)` se lee como *"Si es FALSO que la contraseña cumple el patrón, salta el error"*.

---

## 5. El Bloque `try...catch` y la Conexión al Backend

Toda conexión a internet debe ir dentro de un `try...catch` por si falla la conexión.

### Dentro del `try` (el camino feliz):

1. **`supabase.auth.signUp`**: Es la función oficial de la librería de Supabase. Nos crea el usuario y **automáticamente encripta la contraseña** usando el algoritmo *bcrypt* en sus servidores de forma 100% segura.
   - Si da error, extraemos el error como `signUpError` (le cambiamos el nombre para que no choque con nuestra variable de estado `error` de React).
   - Si falla, hacemos `throw signUpError;`, que literalmente "lanza" el código hacia el bloque `catch`.

2. **`fetch('/api/auth/registro', ...)`**: Es la función nativa de JavaScript para hacer peticiones web. La usamos para avisar a **nuestro propio backend** de que el usuario se ha creado, para que nuestra API inserte una fila en nuestra tabla `perfiles`.

3. **Las variables de respuesta**:
   - `data.user`: Contiene la información pública del usuario recién creado.
   - `data.session`: Contiene el token JWT si Supabase considera que el usuario ya está logueado directamente tras el registro.

4. **`window.location.href = '/perfil'`**: Hace lo mismo que `router.push`, pero `window.location` fuerza una recarga completa y "dura" de la ventana entera del navegador. A veces, tras el login, es mejor forzar la recarga para que toda la app se entere bien de que ahora hay un usuario conectado.

### Dentro del `catch` (el camino de los errores):

```typescript
} catch (err: any) {
  setError(err.message || 'Error en el registro');
}
```
Si cualquier cosa (Supabase, el fetch, etc.) ha fallado, el código "cae" aquí. Cogemos el mensaje del error (`err.message`, que viene implícito de JavaScript o Supabase) y se lo pasamos a nuestra función `setError` para que pinte la cajita roja en pantalla.

---

## 6. Curiosidades del Código HTML/Visual

- **`{error && (...)}`**: Esto es JavaScript puro metido dentro del HTML (se llama JSX). Significa "Condición && Acción". En este caso: *Si la variable `error` tiene algún texto, DIBUJA la alerta roja que hay a continuación. Si está vacía, no dibujes nada.*
- **`<div className="sm:mx-auto...">`**: Es un bloque contenedor normal de HTML. Todo lo de `className` son clases de Tailwind CSS que dicen: pon fondo blanco, dibuja una sombra, redondea los bordes, etc.
- **`onClick={() => setRol('familia')}`**: Es un botón que, al ser pulsado, dispara la función `setRol` para guardar la palabra "familia" en la memoria de nuestro estado.

---

## 7. Preguntas del Tribunal Preparadas

**P: En el método `handleRegistro`, ¿qué es `e.preventDefault()` y por qué lo necesitáis?**
> "Al utilizar React para hacer una Single Page Application, necesitamos tener control total del flujo de datos sin interrupciones. El `preventDefault` cancela el comportamiento por defecto de HTML de recargar la página entera al hacer un Submit, lo que nos permite capturar los datos, hacer validaciones locales inmediatas y enviar todo al backend en segundo plano de manera limpia."

**P: ¿Qué pasa exactamente cuando un usuario se registra y qué papel juega el bloque `try...catch`?**
> "Usamos `try...catch` porque las llamadas a bases de datos asíncronas siempre tienen riesgo de fallo. En el bloque `try`, primero llamamos a la librería de Supabase para registrar y encriptar las credenciales. Si tiene éxito, hacemos un `fetch` interno a nuestra propia API REST para consolidar el perfil de negocio o familia. Si cualquiera de las dos llamadas da un error (por ejemplo, email duplicado), el hilo de ejecución salta de inmediato al bloque `catch`, donde capturamos el `err.message` y renderizamos el componente visual de error para avisar al usuario, sin que la app se cuelgue."
