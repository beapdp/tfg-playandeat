# 🚀 ¿Por qué Next.js? Guía de Defensa para el TFG

Esta guía explica de forma sencilla y técnica por qué hemos elegido **Next.js** como base de nuestro proyecto y cómo justifica que tengamos el "Backend" dentro del mismo código. Es ideal para que todo el equipo hable el mismo idioma frente al tribunal.

---

## 1. La Diferencia Clave: ¿Librería o Framework?

- **React es una LIBRERÍA:** Solo sirve para pintar la interfaz (botones, textos, colores). Es como comprar solo el chasis de un coche.
- **Next.js es un FRAMEWORK:** Es el coche completo. Incluye el chasis (React), pero también el motor, las luces, los frenos y el GPS.

**¿Por qué importa?** Al ser un Framework, Next.js ya viene con un **servidor de Node.js integrado**. Eso es lo que nos permite programar el Backend sin salir del proyecto.

---

## 2. El Concepto de "Fullstack"

Tradicionalmente, las aplicaciones web se hacían en dos trozos separados:
1. **Frontend:** El diseño (React/Angular).
2. **Backend:** El servidor (Node.js/Express, Python, etc.).

**Con Next.js, somos "Fullstack" por naturaleza:**
Tenemos una carpeta `/app` donde conviven las páginas que ve el usuario con las **API Routes** (los archivos `route.ts`). Esto significa que un solo proyecto gestiona tanto lo visual como la lógica de base de datos.

---

## 3. Los 3 Pilares que debéis mencionar en la defensa

### 🟢 Pilar 1: API Routes (Las "Puertas" del Backend)
Son funciones que se ejecutan exclusivamente en el servidor. 
- **Para qué sirven:** Para que el navegador del usuario no hable directamente con la base de datos (lo cual sería inseguro), sino que hable con nuestras API Routes.
- **Ventaja:** Podemos validar contraseñas, comprobar roles de usuario y filtrar datos de forma secreta antes de enviarlos a la web.

### 🟢 Pilar 2: Server-Side Rendering - SSR (Cocinado en el Servidor)
A diferencia de React normal, donde la web llega "vacía" y se rellena en el navegador, Next.js puede enviar la web ya "rellenada" con datos.
- **Ventaja:** Es mucho más rápido para el usuario y mucho mejor para el SEO (Google puede leer vuestra web perfectamente porque ya viene con el contenido puesto).

### 🟢 Pilar 3: TypeScript Unificado
Al tener el Front y el Back en el mismo sitio, usamos el mismo lenguaje en ambos lados.
- **Ventaja:** Si defino que un "Restaurante" tiene nombre y coordenadas, ese mismo diseño me sirve para el formulario (Front) y para la base de datos (Back). Evita muchísimos errores de comunicación.

---

## 4. Ventajas "Ganadoras" para el Tribunal

Si os preguntan: *"¿No hubiera sido más fácil hacerlo solo con React?"*, responded esto:

1. **Eficiencia en el Despliegue:** *"Al usar Next.js, solo tenemos que desplegar un único proyecto. Esto reduce costes de infraestructura y simplifica el mantenimiento"*.
2. **Seguridad Nativa:** *"Al tener nuestro propio Backend con API Routes, los datos sensibles (como las claves de Supabase) nunca ya viajan al navegador del usuario, se quedan protegidos en nuestro servidor"*.
3. **Rendimiento:** *"Gracias al renderizado en el servidor, nuestra web carga mucho más rápido que una aplicación de React convencional"*.

---

## 5. Pregunta Típica: "¿Qué es Node.js y qué tiene que ver con Next?"

**Respuesta rápida:** Node.js es el entorno que permite ejecutar JavaScript fuera del navegador (en el servidor). **Next.js funciona sobre Node.js**. Es gracias a Node.js que podemos conectarnos a Supabase, enviar emails o gestionar sesiones de usuario de forma profesional.

---

## 💡 Resumen para recordar:
> *"Usamos Next.js porque es un **Framework Fullstack**. Nos permite integrar el Frontend (React) y el Backend (API Routes) en un solo sistema robusto, seguro y optimizado para buscadores, funcionando todo sobre un servidor de **Node.js**"*. 🚀🤖
