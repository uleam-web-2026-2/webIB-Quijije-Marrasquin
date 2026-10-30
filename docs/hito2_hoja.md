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

| Vista | Qué pide | A qué tabla | Con qué filtro u orden | Qué puede fallar | ¿Funciona ya? |
|---|---|---|---|---|---|
| Formulario de personalización — selector “Estilo base” | Obtener y mostrar los estilos disponibles para elegir uno al personalizar el diseño. | `public.estilos_base` | Consulta `.select('*').order('nombre')`, mediante `obtenerEstilosBase()` en `src/lib/consultasSupabase.ts`; sin filtro. | Error de red o de Supabase, permisos de lectura o ausencia de registros; el formulario muestra carga, error y lista vacía. El guardado del diseño sigue siendo local. | Sí |
| Diseños de Supabase — listado | Obtener los diseños visibles para la cuenta autenticada y mostrar nombre, estado y fecha. | `public.disenos_corte` | `obtenerDisenosAutorizados()` ordena por `creado_en` descendente. RLS determina qué filas autorizadas devuelve la consulta. | Sesión no autenticada, error de consulta o ausencia de filas autorizadas. | Sí |
| Diseños de Supabase — detalle relacionado | Al pulsar «Ver detalle», obtener el diseño seleccionado y su estilo relacionado. | `public.disenos_corte` y relación `public.estilos_base` | `obtenerDisenoConEstiloPorId()` filtra con `.eq('id_diseno', idDiseno)` y selecciona `estilos_base(...)`; RLS limita el acceso. | ID no visible o no autorizado, error de Supabase o relación de estilo nula. | Sí |
| Inicio de sesión — cuenta de cliente | Iniciar o cerrar sesión de la cuenta. | Supabase Auth (`auth.users`; API de autenticación) | `signInWithPassword()` valida credenciales; `signOut()` cierra la sesión. | Credenciales incorrectas, correo sin confirmar o error del servicio de autenticación. | Sí |
| Mis diseños — diseños guardados | Consultar las fichas creadas o guardadas localmente. | Sin tabla Supabase; `localStorage` mediante `cargarDiseños()` y `guardarDiseños()` de `src/lib/diseños.ts`. | Almacenamiento local del navegador; no hay filtro ni orden de consulta Supabase. | Datos locales ausentes, inválidos o inaccesibles en el navegador. | Plan |
| Barberías — selección de barbería | Mostrar las barberías disponibles y permitir seleccionar una. | Actualmente datos locales de `barberiasRegistradas` en `src/lib/data/barberias.ts`; consulta futura prevista a `public.barberias`. | Actualmente sin filtro ni orden de Supabase; la consulta remota no está implementada. | Los datos locales pueden no coincidir con la tabla remota; aún no hay consulta Supabase desde esta vista. | Plan |
| Enviar diseño — revisión y envío | Revisar un diseño finalizado, elegir barbería y registrar el envío. | Actualmente diseños y envíos locales (`src/lib/envios.ts`); destino de datos previsto: `public.envios_diseno`. | Actualmente opera con estado local; no hay filtro ni orden de consulta Supabase implementados. | Persistencia local o datos seleccionados no disponibles; no hay consulta Supabase para registrar o recuperar el envío. | Plan |
| Panel de barbería — diseños recibidos | Mostrar los diseños recibidos por la barbería seleccionada. | Actualmente envíos locales; destino de datos previsto: `public.envios_diseno`, relacionado con `public.disenos_corte` y `public.barberias`. | Actualmente carga envíos locales; no existe filtro Supabase por barbería. | No refleja envíos remotos y puede no tener registros locales. | Plan |
| Citas de hoy — Barbero (vista documentada para el Hito 1) | Mostrar citas con hora, cliente, servicio, estado y acción. | No hay tabla de citas en el esquema vigente de Corte Ideal. | No existe consulta ni filtro/orden actual para esta vista. | La vista pertenece al modelo anterior documentado en `docs/ficha_negocio.md`, sección 7; no forma parte de la aplicación actual. | Plan |
| Solicitar una cita — Cliente (vista documentada para el Hito 1) | Capturar nombre, servicio, fecha, hora y observaciones de una cita. | No hay tabla de citas en el esquema vigente de Corte Ideal. | No existe consulta ni filtro/orden actual para esta vista. | Vista del modelo anterior; el formulario actual personaliza cortes y no gestiona citas. | Plan |
| Clientes (vista relacionada documentada para el Hito 1) | Explicar la asociación entre cliente y cita. | `public.clientes` existe, pero no hay una pantalla independiente de listado de clientes. | No existe consulta de pantalla actual ni filtro/orden implementado para esta vista. | La descripción de Hito 1 pertenece al modelo anterior; la tabla actual se usa mediante las relaciones y políticas del modelo de diseños. | Plan |

La relación consultada en el detalle es la clave foránea `disenos_corte.id_estilo → estilos_base.id_estilo`. Las vistas del Hito 1 se identificaron en `docs/ficha_negocio.md`, sección 7, y describen el modelo anterior de citas; se conservan como referencia, no como funciones actuales. Las demás vistas se identificaron en los enlaces de navegación y secciones de `src/App.svelte`. El formulario actual personaliza diseños en lugar de solicitar citas; las fichas, barberías y envíos locales no se presentan como consultas Supabase implementadas.

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
| Demostración 2 — Listado y detalle | Completado | La sesión autenticada muestra diseños consultados desde Supabase y autorizados por RLS; cada diseño ofrece «Ver detalle», que consulta su `id_diseno` y presenta el estilo relacionado de `estilos_base` y el estado como texto. Evidencia del detalle: `docs/hito2_capturas/demostracion-2-detalle-relacionado.png`. |
| Demostraciones 3 y 4 | Pendiente | A cargo del compañero, según la división de trabajo del equipo. No se detallan funcionalidades que no fueron especificadas en este alcance. |

**Declaración de herramientas:** GitHub Copilot y ChatGPT se utilizaron como herramientas de apoyo para el desarrollo y la redacción de documentación. Esta declaración no reemplaza la revisión del equipo ni atribuye a esas herramientas la ejecución o verificación de políticas, datos o consultas no comprobadas.
