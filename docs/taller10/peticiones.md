# Semana 10 — Registro de peticiones y pruebas

## Registro

Los resultados de red deben completarse únicamente después de ejecutar cada caso. No se asignan códigos HTTP ni cuerpos de respuesta por anticipado. No incluir capturas de encabezados `Authorization`, cookies, tokens ni credenciales.

| Caso | Petición | Código | Cuerpo de la respuesta | Qué mostró la pantalla |
|---|---|---|---|---|
| CASO 1: PATCH autenticado con política UPDATE activa | `PATCH` a `public.disenos_corte`, filtrado por `id_diseno` y estado leído, con cuerpo `{"estado_diseno":"<nuevo estado>"}`. | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL |
| CASO 2: PATCH sin sesión | Repetir el `PATCH` de prueba sin encabezado `Authorization` ni cookies de sesión; conservar solo la configuración pública necesaria del cliente REST. | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL |
| CASO 3: PATCH autenticado con política UPDATE temporalmente retirada | En un proyecto aislado de prueba, retirar temporalmente solo la política UPDATE y enviar el mismo `PATCH` autenticado. RLS debe permanecer habilitado. | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL |
| CASO 4: GET con token inválido tras recargar | Invalidar/revocar la sesión de prueba desde Supabase Auth, recargar la aplicación y observar la validación `GET` del usuario. No inspeccionar ni copiar el token. | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL |
| CASO 5: PATCH desde una copia vieja | Dos sesiones del mismo propietario cargan el mismo estado. B cambia el estado; A, sin recargar, intenta guardar otro estado con la copia anterior. | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL | PENDIENTE DE PRUEBA MANUAL |

## Instrucciones manuales

Antes de probar, usar un diseño de prueba que pertenezca a la cuenta autenticada y que cumpla las características requeridas si se va a probar `Finalizado`. Abrir las herramientas de desarrollador del navegador, pestaña **Network**, limpiar el registro y filtrar por `disenos_corte` o por las peticiones de Supabase. Registrar el método, URL sin parámetros sensibles, código HTTP real, cuerpo de respuesta real y mensaje visible. Nunca copiar encabezados de autorización, cookies ni valores de tokens a este documento o a las capturas.

### Caso 1 — PATCH autenticado y política activa

1. Iniciar sesión con una cuenta cuyo cliente sea propietario del diseño de prueba.
2. En **Diseños de Supabase**, seleccionar un estado permitido y pulsar **Actualizar estado**.
3. Confirmar que la pantalla solo muestra éxito tras la respuesta y que la fila/listado y el detalle reflejan el estado confirmado.
4. Registrar los datos de respuesta reales en la tabla. No asumir un código o cuerpo esperado.

### Caso 2 — PATCH sin sesión

1. Usar un entorno de prueba y una petición de prueba no sensible; cerrar sesión.
2. En Network, usar **Edit and Resend** sobre el `PATCH` del Caso 1 o un cliente REST del navegador. Quitar `Authorization` y cookies de sesión; no copiar ningún token. Mantener únicamente la configuración pública que el cliente necesite para identificar el proyecto.
3. Enviar el `PATCH` y registrar el código/cuerpo reales. La sesión debe seguir cerrada; no abrir los datos de otro usuario.
4. La interfaz normal oculta la sección remota cuando no hay sesión. Registrar ese comportamiento y el resultado del `PATCH` manual por separado.

### Caso 3 — PATCH con política UPDATE temporalmente retirada

1. Hacerlo exclusivamente en un proyecto Supabase aislado de pruebas, nunca en el proyecto con datos de uso. Verificar primero que RLS continúe habilitado y conservar la definición exacta de la política UPDATE.
2. Desde SQL Editor, retirar manualmente solo la política `Clientes actualizan sus propios disenos`; no retirar la política SELECT, no deshabilitar RLS y no cambiar grants.
3. Enviar un `PATCH` autenticado de prueba y registrar el código/cuerpo reales y el mensaje de interfaz. No presumir que un `PATCH` sin filas coincidirá con un código específico.
4. Restaurar inmediatamente la política UPDATE con la definición de `docs/hito2_esquema.sql` y verificar en SQL Editor que las tres políticas estén presentes. No dejar el entorno de prueba alterado.

### Caso 4 — sesión inválida y recarga

1. Iniciar sesión en un navegador de prueba y confirmar la restauración normal.
2. Revocar o invalidar esa sesión desde la administración de Supabase Auth del proyecto de prueba; no inspeccionar ni editar manualmente el valor almacenado del token.
3. Recargar la aplicación. En Network, localizar la validación `GET` de Supabase Auth, registrar el resultado real y comprobar que la interfaz limpia el estado autenticado, informa que la sesión fue rechazada y permite volver a iniciar sesión.
4. No incluir encabezados ni valores de tokens en el registro o captura.

### Caso 5 — copia vieja

1. Abrir dos navegadores/perfiles de prueba con sesiones autorizadas del mismo propietario. No usar usuarios propietarios distintos: RLS no permite que compartan el diseño y no se debe ampliar esa política.
2. En ambos, cargar el mismo diseño y conservar la página A sin recargar.
3. En B, cambiar el estado y confirmar la respuesta. Luego, en A, intentar actualizar usando la copia cargada anteriormente.
4. Comprobar que la actualización condicional no informa éxito; la pantalla debe explicar que el diseño pudo cambiar y ofrecer **Recargar diseños**. Usar esa acción y verificar el estado nuevo.
5. Registrar la respuesta real y tomar la captura sin encabezados o tokens.

## Capturas

Guardar solo capturas reales en `docs/taller10/capturas/` con estos nombres:

- `caso1.png`
- `caso2.png`
- `caso3.png`
- `caso4.png`
- `caso5.png`

Al momento de preparar este documento no se han realizado ni añadido capturas; todos los casos permanecen pendientes de prueba manual.
