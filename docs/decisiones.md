# Registro de Decisiones de Arquitectura Semántica

## 1. Uso de `<dl>` (Lista de definición) para el Resumen de Estados
* **Elegido:** `<dl>` con `<dt>` (nombre del estado) y `<dd>` (cantidad de tickets).
* **Descartado:** Un `<div>` con texto corrido o un conjunto de párrafos `<p>`.
* **Consecuencia que evita:** Permite que los lectores de pantalla reconozcan la relación explícita nombre-valor. Al navegar por voz o teclado, el usuario entiende la asociación "Abiertos: 2" en lugar de escuchar valores numéricos aislados sin contexto.

## 2. Uso de `<table>` semántica con `scope="col"` para el Listado de Tickets
* **Elegido:** Elemento `<table>` estructurado con `<thead>`, `<tbody>`, `<th> scope="col"` y `<caption>`.
* **Descartado:** Una lista de tarjetas estructuradas en `<ul>` / `<li>` con contenedores `<div>`.
* **Consecuencia que evita:** Las tecnologías de asistencia leen la celda junto con el encabezado correspondiente (por ejemplo, "Estado: En progreso"). Sin la tabla y los atributos `scope`, la lectura de celdas secuenciales resulta incomprensible para un usuario no visual.

## 3. Navegación vs Acción en los controles ("Ver", "Nuevo ticket", "Aplicar filtros")
* **Elegido:** `<a href="#">` para "Nuevo ticket" y "Ver"; `<button type="submit">` para "Aplicar filtros".
* **Descartado:** Usar `<button>` para navegación o `<div onclick="...">` para filtros.
* **Consecuencia que evita:** Un `<div>` interactivo no recibe foco de teclado por defecto ni responde a la tecla `Enter`. Usar `<a>` permite navegación directa con URL, mientras que `<button>` garantiza el comportamiento accesible al enviar el formulario de filtrado.

## 4. El pie usa `<footer>` y la marca de tiempo usa `<time>`
* **Elegido:** `<footer>` con párrafos `<p>` y la marca de tiempo en `<time datetime="2026-09-11T09:40">`.
* **Descartado:** Un `<div class="footer">` con texto plano.
* **Consecuencia que evita:** `<footer>` se anuncia como región de pie de página (landmark) accesible por salto directo. El atributo `datetime` de `<time>` estandariza la fecha para lectores de pantalla y máquinas sin depender de formatos locales.

## 5. Criterio de revisión final
* **Elegido:** Mantener una estructura de contenido clara, con títulos, formularios y tablas bien etiquetados.
* **Descartado:** Añadir elementos visuales sin relación con la tarea o ocultar contenido con estilos ambiguos.
* **Consecuencia que evita:** La entrega refleja un producto comprensible desde el primer vistazo y cumple con la intención del taller: separar negocio, arquitectura y prototipo en fases verificables.
