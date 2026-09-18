# Dominio — Corte Ideal

## 1. Negocio

**Corte Ideal** es una barbería donde el cliente puede personalizar su corte antes de reservar una cita. El sistema permite organizar las citas y consultar su estado para facilitar la atención del barbero.

## 2. Starter Story

Enlace del video Starter Story utilizado como referencia:

https://________

**Pendiente:** reemplazar el marcador por el enlace concreto del video Starter Story utilizado para el análisis del negocio. No se inventa un enlace.

## 3. Adaptación a Ecuador

La propuesta se adapta a una barbería ecuatoriana que trabaja con reservas de citas y servicios de corte personalizados. Los ejemplos mostrados en la pantalla son ficticios y no contienen datos personales reales.

## 4. Entidades

### Cita

Representa una reserva de un servicio de barbería para una fecha y hora determinadas.

### Cliente

Representa a la persona que solicita una cita y define las características de su corte.

## 5. Entidad que cambia de estado

La entidad que cambia de estado es **Cita**.

Estados:

1. **Solicitada:** el cliente ha pedido una cita.
2. **Aceptada:** el barbero ha aceptado la cita.
3. **En proceso:** la atención del cliente ha comenzado.
4. **Completada:** el servicio terminó.

Flujo principal:

**Solicitada → Aceptada → En proceso → Completada**

## 6. Roles y permisos

### Barbero

Puede consultar las citas del día, revisar el cliente y el servicio solicitado, aceptar una cita, iniciar la atención y marcarla como completada.

### Cliente

Puede solicitar una cita, consultar sus propias citas, consultar su estado y personalizar su corte.

Los permisos son diferentes: el barbero gestiona la atención y el avance de la cita, mientras el cliente solicita y consulta sus propias citas.

## 7. Pantalla desarrollada

**Rol:** Barbero.

**Pregunta de la pantalla:**

> ¿Qué citas tengo hoy y en qué estado está cada una?

**Entidad listada:** Cita.

**Columnas:**
- Hora
- Cliente
- Servicio
- Estado
- Acción

Se utilizan cinco columnas. La columna Estado representa los estados de la Cita.

## 8. Datos de prueba

Se usan datos inventados:

- Alex — Solicitada
- Sam — Aceptada
- Dani — En proceso
- Leo — Completada

No se utilizan datos personales reales.

## 9. Pendientes

- Reemplazar el marcador de Starter Story por el enlace concreto utilizado.
- Confirmar con el equipo quién realiza cada transición de estado en la implementación definitiva.
- Implementar posteriormente la lógica real de las acciones.
