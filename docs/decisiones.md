# Decisiones de diseño — Corte Ideal

## 1. Comportamiento a 360 px

**Decisión:** En pantallas estrechas, cada fila de la tabla se convierte en un bloque vertical. Cada `td` utiliza `data-label` para conservar el nombre del campo.

**Consecuencia concreta:** La persona que usa la pantalla puede revisar una cita de forma vertical sin producir desplazamiento horizontal de toda la página.

**Qué se pierde:** Se pierde parte de la comparación inmediata entre varias citas que proporciona una tabla tradicional. En móvil la información se presenta una cita por bloque.

## 2. Columnas del listado

**Decisión:** Se muestran únicamente Hora, Cliente, Servicio, Estado y Acción.

**Consecuencia concreta:** El barbero obtiene en una sola vista los datos necesarios para identificar la atención y conocer su estado, respetando el máximo de cinco columnas.

**Qué se pierde:** Quedan fuera otros datos posibles como teléfono, precio, notas o el detalle completo del diseño personalizado. Esos datos podrán consultarse en una pantalla posterior.
