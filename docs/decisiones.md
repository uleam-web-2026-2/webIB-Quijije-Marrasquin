# Decisiones de diseño — Corte Ideal

## 1. Comportamiento a 360 px

**Decisión:** En pantallas estrechas, cada fila de la tabla se convierte en un bloque vertical. Cada `td` utiliza `data-label` para conservar el nombre del campo.

**Consecuencia concreta:** La persona que usa la pantalla puede revisar una cita de forma vertical sin producir desplazamiento horizontal de toda la página.

**Qué se pierde:** Se pierde parte de la comparación inmediata entre varias citas que proporciona una tabla tradicional. En móvil la información se presenta una cita por bloque.

## 2. Columnas del listado

**Decisión:** Se muestran únicamente Hora, Cliente, Servicio, Estado y Acción.

**Consecuencia concreta:** El barbero obtiene en una sola vista los datos necesarios para identificar la atención y conocer su estado, respetando el máximo de cinco columnas.

**Qué se pierde:** Quedan fuera otros datos posibles como teléfono, precio, notas o el detalle completo del diseño personalizado. Esos datos podrán consultarse en una pantalla posterior.

## Semana 10 · Sesión y almacenamiento seguro

**Decisión:** La persistencia, renovación y cierre de sesión se delegan a Supabase JS. Al restaurar una sesión, la aplicación valida al usuario con el servidor; si la sesión es rechazada o no coincide, limpia el estado autenticado de la interfaz y elimina la sesión local mediante la API de Supabase.

**Riesgo:** La persistencia de sesión del cliente puede utilizar `localStorage`, que es accesible a JavaScript y puede quedar expuesto ante una vulnerabilidad XSS.

**Mitigación:** No se guardan tokens ni contraseñas en almacenamiento propio ni se escriben en consola. La interfaz debe evitar inyecciones, conservar el escape de texto de Svelte y no renderizar contenido no confiable como HTML.

## Semana 10 · concurrencia

### La copia vieja

**Alternativas consideradas:**

1. Actualizar siempre por `id_diseno` y recargar la lista después. Se descartó porque una lectura posterior no evita que el UPDATE incondicional sobrescriba silenciosamente el estado más nuevo.
2. Agregar una columna de versión o comparar `actualizado_en`. Se descartó para esta fase porque requiere una migración de esquema y una estrategia de versión/precisión temporal adicional.
3. Actualizar atómicamente por `id_diseno` y por el `estado_diseno` que la interfaz leyó. Se eligió porque usa la fila cargada como precondición en una sola petición; si ya cambió, no se modifica ninguna fila y la interfaz ofrece recargar.

**Prueba con RLS:** Las políticas actuales no permiten que dos propietarios distintos escriban el mismo diseño. Para reproducir la copia vieja sin ampliar RLS, abrir dos sesiones autorizadas del mismo propietario (por ejemplo, el mismo usuario en dos navegadores): cargar el diseño en ambas, cambiar su estado desde la sesión B y luego intentar cambiarlo desde la copia sin recargar de A.

## Semana 10 · dónde vive cada cosa

| Dato | Clase | Dónde vive | Por qué ahí | Qué arriesga |
|---|---|---|---|---|
| Diseño remoto | Persistente y compartido | Supabase, tabla `public.disenos_corte` | RLS aplica la propiedad en el servidor; es la fuente de verdad entre sesiones. | Cambios no autorizados si permisos o políticas se amplían incorrectamente; errores de red pueden impedir confirmar una operación. |
| Sesión/token | Credencial de autenticación | Persistencia administrada por Supabase JS en el navegador; validación del usuario en Supabase Auth | SDK mantiene renovación y ciclo de sesión; la aplicación no crea almacenamiento paralelo. | `localStorage` es accesible desde JavaScript y puede quedar expuesto ante XSS. No guardar tokens manualmente ni imprimirlos. |
| Filtro | Preferencia de interfaz | `localStorage` del navegador | Debe sobrevivir recargas y no es dato de negocio ni fuente de autorización. | Puede ser manipulado o no estar disponible; validar valores desconocidos y usar `Todos` como alternativa. |
| Borrador | Preferencia temporal del formulario | `sessionStorage` de la pestaña | Se restaura en la misma pestaña y se separa de diseños remotos y del almacenamiento persistente local. Solo guarda opciones cerradas de corte. | Se pierde al cerrar la pestaña y sigue siendo accesible a JavaScript; no persistir credenciales, nombre del cliente ni texto libre. |
