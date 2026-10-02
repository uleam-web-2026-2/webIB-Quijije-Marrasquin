# Ficha del negocio — Corte Ideal

## 1. Negocio de referencia

**Corte Ideal** toma como referencia el caso de **Antonio’s Barber Shop**, presentado por Starter Story.

- **Qué vende y a quién:** servicios de barbería y productos de cuidado masculino para clientes que buscan una experiencia de barbería moderna.
- **Cómo cobra:** servicios en local, venta de productos y una academia de barbería.
- **Cifra declarada por el fundador:** alrededor de **€1,5 millones de facturación anual**, con más de **250 clientes al día** distribuidos en dos locales.
- **Fuente:** https://www.starterstory.com/how-to-start-barber-shop

Corte Ideal adapta la idea al contexto académico del proyecto: una barbería que permite **personalizar el corte, reservar una cita y consultar su estado** desde una interfaz web sencilla.

## 2. Contraste obligatorio

Como contraste se toma un caso de una barbería de alto tráfico cuya operación dependía de agenda manual, llamadas, mensajes y redes sociales. El caso reporta problemas de sobrecarga administrativa, citas perdidas y espacios vacíos por inasistencias antes de digitalizar la gestión.

- **Fuente del contraste:** https://www.mosan.ca/case-studies-and-insights/f820b243
- **Hipótesis del equipo:** si las reservas y los estados de atención se gestionan en canales dispersos, aumenta la posibilidad de confusión, tiempos muertos y pérdida de citas. Corte Ideal busca reducir esa fricción centralizando la información principal de cada cita.

## 3. Adaptación al Ecuador

### Restricción 1 — Facturación SRI y régimen tributario

Una barbería ecuatoriana debe considerar el régimen tributario que le corresponda y la emisión de comprobantes cuando aplique.

**Efecto en el negocio:** el sistema debe dejar preparada la posibilidad de registrar datos necesarios para facturación o exportar información de la atención sin mezclar esa lógica con la reserva inicial.

Fuente de referencia: https://www.sri.gob.ec/facturacion-electronica

### Restricción 2 — Medios de pago locales

El negocio puede recibir pagos en efectivo o por transferencia, por lo que la forma de pago debe poder registrarse sin obligar al cliente a usar una pasarela específica.

**Efecto en el modelo:** se propone el atributo conceptual `medio_pago` dentro de la entidad **Cita**. En el avance actual todavía no se captura en el formulario; queda como decisión del modelo para una fase posterior.

### Restricción 3 — Uso móvil y conectividad variable

El sistema debe funcionar correctamente desde pantallas pequeñas y con una interfaz ligera.

**Efecto en el producto:** el listado se adapta a móvil, mantiene las etiquetas de cada dato y conserva el estado de la cita escrito como palabra, no solo mediante color.

## 4. Modelo de datos

### Cliente

- `id`: número entero
- `nombre`: texto
- `preferencias`: texto

### Cita

- `id`: número entero
- `fecha_hora`: fecha y hora
- `servicio`: texto
- `estado`: uno de cuatro estados
- `observaciones`: texto opcional
- `medio_pago`: texto, propuesto para una fase posterior

### Servicio

- `id`: número entero
- `nombre`: texto
- `duracion`: minutos

### Relaciones

- **Cliente 1 — N Cita**: un cliente puede tener varias citas; cada cita pertenece a un cliente.
- **Servicio 1 — N Cita**: un servicio puede aparecer en varias citas; cada cita solicita un servicio principal.

## 5. Máquina de estados

La entidad que cambia de estado es **Cita**.

1. **Solicitada** — estado inicial.
2. **Aceptada** — el barbero confirma que atenderá la cita.
3. **En proceso** — la atención ya comenzó.
4. **Completada** — el servicio terminó.

Flujo principal:

**Solicitada → Aceptada → En proceso → Completada**

Las transiciones de avance son realizadas por el **barbero**.

**Transición prohibida:** `Completada → Aceptada`.

**Razón:** una cita completada ya representa una atención cerrada. Si el cliente necesita otra atención, se crea una nueva cita en lugar de reabrir la anterior.

## 6. Roles y permisos

### Barbero

- Ve las citas programadas del día.
- Consulta cliente, servicio y estado.
- Puede aceptar una cita, iniciar la atención y marcarla como completada.
- No solicita citas como cliente.

### Cliente

- Puede solicitar una cita.
- Consulta únicamente sus propias citas.
- Puede indicar el servicio y observaciones de la reserva.
- No puede cambiar por sí mismo el estado operativo de la atención.

## 7. Vistas y accesibilidad

### Vistas actuales

- **Citas de hoy — Barbero:** listado con Hora, Cliente, Servicio, Estado y Acción.
- **Solicitar una cita — Cliente:** formulario con Nombre del cliente, Servicio, Fecha, Hora y Observaciones.
- **Clientes:** sección relacionada que explica la asociación entre cliente y cita.

### Accesibilidad implementada

- El estado de cada cita se muestra como **palabra visible**, además del color.
- Los campos obligatorios tienen mensajes de error en texto.
- Los errores se asocian a sus campos mediante `aria-describedby` y `aria-invalid="true"`.
- El formulario se puede recorrer con **Tab** en orden lógico y con foco visible.
- Se corrigieron contrastes de texto hasta superar la relación mínima indicada para texto normal.
- Auditoría Lighthouse Accessibility: **95/100 antes** y **100/100 después**.

## 8. Declaración de IA

Se utilizó **GitHub Copilot / IA de Visual Studio** como apoyo para implementar el formulario, revisar asociaciones accesibles, ajustar contraste y redactar documentación técnica.

También se utilizó **ChatGPT** para revisar el cumplimiento del taller, estructurar la ficha y preparar las diapositivas.

Las pruebas manuales de teclado, panel Accessibility y Lighthouse fueron realizadas por el equipo.