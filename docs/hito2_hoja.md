# Hito 2 — Contrato de datos y consultas

## 1. Tablas

El modelo relacional de Corte Ideal se compone de cinco tablas. La definición de columnas, claves y restricciones está documentada en [hito2_esquema.sql](./hito2_esquema.sql). Las tablas y relaciones se contrastan con el esquema informado para el proyecto Supabase.

| Tabla | Clave primaria | Claves foráneas | Relación |
|---|---|---|---|
| `clientes` | `id_cliente` (`UUID`) | `usuario_id` → `auth.users.id` (única y nullable) | Un cliente puede tener varios diseños. |
| `estilos_base` | `id_estilo` (`UUID`) | Ninguna | Un estilo base puede utilizarse en varios diseños. |
| `disenos_corte` | `id_diseno` (`UUID`) | `id_cliente` → `clientes.id_cliente`; `id_estilo` → `estilos_base.id_estilo` (nullable) | Cada diseño pertenece a un cliente y puede referenciar un estilo base. |
| `barberias` | `id_barberia` (`UUID`) | `usuario_id` → `auth.users.id` (única y nullable) | Una barbería puede recibir varios envíos. |
| `envios_diseno` | `id_envio` (`UUID`) | `id_diseno` → `disenos_corte.id_diseno`; `id_barberia` → `barberias.id_barberia` | Cada envío corresponde a un diseño y una barbería. |

`disenos_corte.estado_diseno` admite `Borrador`, `Personalizado` y `Finalizado`. La restricción del esquema exige las características de corte cuando el diseño está finalizado. `envios_diseno.estado_envio` admite `Recibido`, `Aceptado` y `Rechazado`; `copia_diseno` es JSONB obligatorio y debe ser un objeto no vacío.

El archivo SQL documenta la definición del esquema y no es evidencia por sí solo de su ejecución remota. El estado de las políticas y los datos descrito en esta hoja corresponde a las comprobaciones y confirmaciones realizadas en el proyecto Supabase.

## 2. Vista × consulta

| Vista/interfaz implementada | Consulta Supabase | Estado |
|---|---|---|
| Formulario de personalización — selector “Estilo base” | `estilos_base`: `.select('*').order('nombre')`, mediante `obtenerEstilosBase()` en `src/lib/consultasSupabase.ts`. | Implementada y confirmada previamente con HTTP 200 y ocho registros. El formulario muestra carga, error y resultado vacío; no sustituye una falla con datos locales. |
| “Detalle relacionado — Diseño y estilo base” | `disenos_corte` con la relación `estilos_base(...)`, orden por `creado_en` descendente y límite de un registro, mediante `obtenerUnDisenoConEstilo()` en `src/lib/consultasSupabase.ts`. | Completada y comprobada en el navegador con sesión autenticada: se muestra el diseño real «Mi corte R7», su estado `Finalizado` y el estilo relacionado «Taper Fade». La consulta respeta RLS. Evidencia: [demostracion-2-detalle-relacionado.png](./hito2_capturas/demostracion-2-detalle-relacionado.png). |

La relación consultada en el detalle es la clave foránea `disenos_corte.id_estilo → estilos_base.id_estilo`. La lectura pública de `estilos_base` permite seleccionar el nombre del estilo en el formulario. La tabla de barberías que se presenta actualmente en otra sección de la aplicación procede de datos TypeScript locales; no se presenta aquí como una consulta Supabase implementada.

## 3. Matriz rol × tabla × operación

La matriz distingue las políticas de lectura confirmadas para este proyecto de las capacidades que todavía no están autorizadas. RLS está habilitado en las cinco tablas. No se deben inferir permisos de escritura a partir de una política de lectura.

| Rol/alcance | Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| Público (`anon`; lectura pública) | `estilos_base` | Permitido por política de lectura | No concedido/documentado | No concedido/documentado | No concedido/documentado |
| Público (`anon`; lectura pública) | `barberias` | Permitido por política de lectura | No concedido/documentado | No concedido/documentado | No concedido/documentado |
| Usuario autenticado | `clientes` | Política SELECT definida para el rol autenticado; el alcance de filas se aplica mediante RLS | No concedido/documentado | No concedido/documentado | No concedido/documentado |
| Usuario autenticado | `disenos_corte` | Política SELECT definida para el rol autenticado; el detalle de Carlos se comprobó respetando RLS | No concedido/documentado | No concedido/documentado | No concedido/documentado |
| Público y usuario autenticado | `envios_diseno` | Sin política SELECT documentada; RLS restringe el acceso | No concedido/documentado | No concedido/documentado | No concedido/documentado |

RLS permanece habilitado en las cinco tablas. Las políticas SELECT para el rol autenticado en `clientes` y `disenos_corte` están disponibles con el filtrado por filas definido en RLS; también se comprobó que la sesión de prueba puede leer el registro de Carlos y su diseño relacionado. La lectura pública de `estilos_base` y `barberias` está disponible según las políticas confirmadas. No se atribuyen permisos de escritura ni se infiere que otras tablas sean legibles. Las políticas privadas adicionales y las políticas de creación que correspondan siguen pendientes para el compañero responsable de las demostraciones 3 y 4. No se propone una política pública para datos privados.

## 4. Usuario de ejemplo

| Registro de demostración | Información documentada |
|---|---|
| Cliente | Carlos, asociado a un usuario de Supabase Auth |
| Diseño | «Mi corte R7» |
| Estilo base | Taper Fade |
| Envío asociado | A Barbería El Patrón, con estado `Recibido` |

La asociación de Carlos con un usuario de Supabase Auth y la visualización autenticada de su diseño fueron comprobadas en el navegador. Esta hoja no incluye correo, contraseña ni identificador UUID. La existencia de los registros se consigna según el contexto confirmado del proyecto; no se agregan identificadores ni datos personales no proporcionados.

## 5. Recuadro de cumplimiento

| Requisito/avance | Estado | Evidencia o pendiente |
|---|---|---|
| Cinco tablas del modelo y relaciones mediante claves foráneas | Completado | Contrato documentado en esta hoja y definido en `docs/hito2_esquema.sql`; el equipo confirma que las tablas están creadas y relacionadas en Supabase. |
| Interfaces TypeScript para las cinco tablas y uniones de estados | Completado | `src/tipos.ts` define `Cliente`, `EstiloBase`, `DisenoCorte`, `Barberia`, `EnvioDiseno`, `EstadoDiseno` y `EstadoEnvio`. |
| Lectura de `estilos_base` para el listado/selector | Completado | `obtenerEstilosBase()` está conectada al selector y la respuesta HTTP 200 con ocho registros fue comprobada previamente en navegador. |
| Detalle de un diseño con su estilo base relacionado | Completado | En navegador, con sesión autenticada, se mostró el diseño real «Mi corte R7» en estado `Finalizado` y su estilo relacionado «Taper Fade», respetando RLS. Evidencia: [demostracion-2-detalle-relacionado.png](./hito2_capturas/demostracion-2-detalle-relacionado.png). |
| RLS habilitado en las cinco tablas | Completado | Confirmado en el contexto del proyecto y contemplado en el esquema SQL. |
| Políticas públicas de lectura de `estilos_base` y `barberias` | Completado | Confirmadas para el proyecto Supabase. |
| Políticas SELECT para usuarios autenticados en `clientes` y `disenos_corte` | Completado | Confirmadas y utilizadas para mostrar el detalle relacionado con sesión autenticada, respetando RLS. |
| Otras políticas privadas y políticas de creación para datos asociados a usuarios | Pendiente | Responsabilidad del compañero; no se atribuyen permisos que todavía no existen. |
| Demostración 1 — Contrato de datos | Completado | Esquema, relaciones, interfaces y permisos actuales documentados. |
| Demostración 2 — Listado y detalle | Completado | Listado real y detalle relacionado confirmados; la captura del detalle autenticado está guardada en `docs/hito2_capturas/demostracion-2-detalle-relacionado.png`. |
| Demostraciones 3 y 4 | Pendiente | A cargo del compañero, según la división de trabajo del equipo. No se detallan funcionalidades que no fueron especificadas en este alcance. |

**Declaración de herramientas:** GitHub Copilot y ChatGPT se utilizaron como herramientas de apoyo para el desarrollo y la redacción de documentación. Esta declaración no reemplaza la revisión del equipo ni atribuye a esas herramientas la ejecución o verificación de políticas, datos o consultas no comprobadas.
