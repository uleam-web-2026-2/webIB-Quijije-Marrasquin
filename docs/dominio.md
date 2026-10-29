# Modelo de dominio — Corte Ideal

## 1. Descripción del negocio

**Corte Ideal — Diseña tu propio estilo** es una aplicación web que permite a los clientes describir con detalle el corte de cabello que desean y compartir ese diseño con una barbería registrada. La barbería revisa las especificaciones y responde aceptando o rechazando el diseño mediante un mensaje predeterminado.

La aplicación facilita la comunicación de preferencias entre clientes y barberías. No gestiona citas, reservas, calendarios ni horarios de atención.

## 2. Problema

Muchas personas tienen dificultades para explicar con precisión las características del corte que desean. Las fotografías de referencia y las explicaciones verbales no siempre comunican correctamente detalles como el degradado, la longitud superior, la textura o el acabado.

Por su parte, las barberías no siempre cuentan con un medio estructurado para recibir y revisar esas preferencias antes de realizar el servicio.

## 3. Solución

El cliente crea un diseño a partir de un estilo base y personaliza sus características mediante opciones y observaciones textuales. Cuando termina de editarlo, puede enviarlo a una barbería registrada. La barbería revisa el diseño recibido y lo acepta o lo rechaza con una respuesta predeterminada. El cliente puede consultar el estado y la respuesta.

La fecha del envío se conserva únicamente como registro histórico; no representa una cita ni una reserva. No se admiten respuestas de texto libre.

## 4. Entidades y atributos

### 4.1 Cliente

Representa a la persona que crea diseños personalizados.

- `idCliente`: identificador único.
- `nombre`: nombre del cliente.

### 4.2 EstiloBase

Representa un estilo de corte que sirve como punto de partida para personalizar un diseño.

- `idEstilo`: identificador único.
- `nombre`: nombre del estilo.
- `descripcion`: explicación breve del estilo.

Ejemplos: Taper Fade, Low Fade, Mid Fade, High Fade, Mullet, Buzz Cut, French Crop y corte clásico.

### 4.3 DiseñoCorte

Representa el corte personalizado creado por un cliente.

- `idDiseño`: identificador único.
- `idCliente`: referencia al cliente propietario.
- `idEstilo`: referencia al estilo base.
- `nombreDiseño`: nombre asignado por el cliente.
- `tipoDegradado`: degradado seleccionado.
- `longitudSuperior`: longitud elegida.
- `textura`: característica del cabello.
- `diseñoLateral`: detalle de los laterales.
- `terminacionNuca`: terminación posterior.
- `estiloBarba`: característica de la barba.
- `observaciones`: indicaciones adicionales.
- `estadoDiseño`: estado de edición del diseño.

### 4.4 Barberia

Representa un establecimiento registrado en la aplicación.

- `idBarberia`: identificador único.
- `nombre`: nombre de la barbería.
- `ubicacion`: ciudad o sector.
- `descripcion`: información breve de la barbería.

### 4.5 EnvioDiseño

Representa el envío de un diseño personalizado a una barbería.

- `idEnvio`: identificador único.
- `idDiseño`: referencia al diseño enviado.
- `idBarberia`: referencia a la barbería destinataria.
- `fechaEnvio`: fecha en que se envió, conservada solo como registro histórico.
- `estadoEnvio`: estado de revisión del envío.
- `respuesta`: mensaje predeterminado según la decisión de la barbería.

Cada envío conserva una copia de las características del diseño tal como estaban al momento de enviarlo. Así, si el cliente modifica posteriormente su diseño original, las especificaciones que recibió la barbería permanecen sin cambios.

## 5. Relaciones y cardinalidades

- **Cliente (1) — (N) DiseñoCorte:** un cliente puede crear varios diseños; cada diseño pertenece a un único cliente.
- **EstiloBase (1) — (N) DiseñoCorte:** un estilo base puede utilizarse en varios diseños; cada diseño utiliza un estilo base.
- **DiseñoCorte (1) — (N) EnvioDiseño:** un diseño puede enviarse a diferentes barberías; cada envío corresponde a un único diseño.
- **Barberia (1) — (N) EnvioDiseño:** una barbería puede recibir muchos envíos; cada envío tiene una única barbería destinataria.

La copia de las especificaciones de cada envío conserva el contenido enviado sin alterar el diseño original.

## 6. Roles y permisos

### Cliente

- Puede crear y personalizar sus diseños.
- Puede consultar y editar sus propios diseños.
- Solo puede enviar a una barbería registrada un diseño en estado **Finalizado**.
- Puede enviar el mismo diseño a diferentes barberías; cada envío se revisa de forma independiente.
- Puede consultar el estado y la respuesta predeterminada de cada envío propio.
- No puede cambiar el estado de un envío ni modificar la respuesta de la barbería.

### Barbería registrada

- Puede consultar los diseños que recibió y sus especificaciones conservadas al momento del envío.
- Puede aceptar o rechazar únicamente los envíos que recibió.
- Al responder, debe seleccionar una de las dos decisiones predeterminadas; no puede redactar una respuesta libre.
- Una vez aceptado o rechazado un envío, no puede cambiar esa decisión.
- No puede consultar ni gestionar envíos dirigidos a otras barberías.

## 7. Estados y transiciones

### 7.1 Estado del diseño

El estado del diseño representa su avance de edición:

1. **Borrador:** estado inicial mientras el cliente crea el diseño.
2. **Personalizado:** el cliente ha definido características del corte.
3. **Finalizado:** el cliente confirma que terminó de editar el diseño.

Flujo de edición:

**Borrador → Personalizado → Finalizado**

Solo un diseño **Finalizado** puede enviarse a una barbería. Los estados de diseño describen la edición del diseño y son independientes del estado de cada envío.

### 7.2 Estado del envío

El estado del envío representa la revisión de la barbería:

1. **Recibido:** estado inicial al enviar un diseño finalizado a una barbería.
2. **Aceptado:** la barbería confirma que puede realizar el diseño.
3. **Rechazado:** la barbería indica que no puede realizar el diseño.

Transiciones permitidas:

- **Recibido → Aceptado**
- **Recibido → Rechazado**

**Aceptado** y **Rechazado** son estados definitivos para ese envío; no se permite cambiar la decisión. Un diseño enviado a varias barberías tiene un envío y una decisión independientes para cada una.

### 7.3 Respuestas predeterminadas

- Si acepta: **“Hemos recibido tu diseño y vamos a realizarlo.”**
- Si rechaza: **“Hemos recibido tu diseño, pero no podemos realizarlo.”**

## 8. Reglas de negocio

1. Un cliente puede crear varios diseños.
2. Cada diseño pertenece a un único cliente y utiliza un estilo base.
3. Un diseño puede contener características personalizadas y observaciones.
4. El diseño debe estar **Finalizado** antes de enviarse.
5. El cliente solo puede enviar diseños a barberías registradas.
6. Un mismo diseño puede enviarse a diferentes barberías.
7. Cada envío tiene una sola barbería destinataria.
8. Cada barbería solo puede gestionar los diseños que recibió.
9. Cada envío comienza en estado **Recibido**.
10. La barbería puede aceptar o rechazar un envío recibido.
11. Las respuestas son predeterminadas y no existe un campo para escribir respuestas libres.
12. Una decisión aceptada o rechazada es definitiva para ese envío.
13. El cliente puede consultar la respuesta de la barbería.
14. La fecha del envío es únicamente un dato histórico: no representa una cita ni una reserva.
15. No existen citas, reservas, calendarios ni horarios de atención en el modelo.
16. Cada envío conserva las características que tenía el diseño al enviarse, aunque el cliente edite posteriormente el diseño original.

## 9. Ejemplo de funcionamiento

1. Una cliente crea el diseño **“Taper con textura”** a partir del estilo base **Taper Fade**.
2. Completa las características del degradado, la longitud superior, la textura y las demás preferencias. El diseño pasa de **Borrador** a **Personalizado** y, cuando confirma que terminó, a **Finalizado**.
3. Envía el diseño finalizado a una barbería registrada. Se crea un envío en estado **Recibido**, con la fecha histórica del envío y una copia de las especificaciones actuales.
4. La barbería consulta ese envío y lo acepta con el mensaje **“Hemos recibido tu diseño y vamos a realizarlo.”**, o lo rechaza con el mensaje **“Hemos recibido tu diseño, pero no podemos realizarlo.”**
5. La cliente consulta la decisión. Si luego modifica su diseño original o lo envía a otra barbería, el envío ya creado conserva sus especificaciones y su decisión no cambia.
