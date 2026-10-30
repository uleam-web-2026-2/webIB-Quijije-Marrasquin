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
| Formulario de personalización — selector “Estilo base” | Obtener y mostrar los estilos disponibles para elegir uno al personalizar el diseño. | `public.estilos_base` | Consulta `.select('*').order('nombre')`, mediante `obtenerEstilosBase()` en `src/lib/consultasSupabase.ts`; sin filtro. | Error de red o de Supabase, permisos de lectura o ausencia de registros; el formulario muestra carga, error y lista vacía. El guardado local sigue disponible y la acción independiente «Guardar en Supabase» crea un borrador para la sesión autorizada. | Sí |
| Diseños de Supabase — listado | Obtener los diseños visibles para la cuenta autenticada y mostrar nombre, estado y fecha. | `public.disenos_corte` | `obtenerDisenosAutorizados()` ordena por `creado_en` descendente. RLS determina qué filas autorizadas devuelve la consulta. | Sesión no autenticada, error de consulta o ausencia de filas autorizadas. | Sí |
| Diseños de Supabase — detalle relacionado | Al pulsar «Ver detalle», obtener el diseño seleccionado y su estilo relacionado. | `public.disenos_corte` y relación `public.estilos_base` | `obtenerDisenoConEstiloPorId()` filtra con `.eq('id_diseno', idDiseno)` y selecciona `estilos_base(...)`; RLS limita el acceso. | ID no visible o no autorizado, error de Supabase o relación de estilo nula. | Sí |
| Inicio de sesión — cuenta de cliente | Iniciar o cerrar sesión de la cuenta. | Supabase Auth (`auth.users`; API de autenticación) | `signInWithPassword()` valida credenciales; `signOut()` cierra la sesión. | Credenciales incorrectas, correo sin confirmar o error del servicio de autenticación. | Sí |
| Mis diseños — diseños guardados | Consultar las fichas creadas o guardadas localmente. | Sin tabla Supabase; `localStorage` mediante `cargarDiseños()` y `guardarDiseños()` de `src/lib/diseños.ts`. | Almacenamiento local del navegador; no hay filtro ni orden de consulta Supabase. | Datos locales ausentes, inválidos o inaccesibles en el navegador. | Sí |
| Barberías — selección de barbería | Mostrar las barberías disponibles y permitir seleccionar una. | Datos locales de `barberiasRegistradas` en `src/lib/data/barberias.ts`; la lectura de `public.barberias` está documentada en la política pública, pero esta vista usa el catálogo local. | Selección y persistencia local; no consulta Supabase desde esta vista. | Los datos locales pueden diferir de los registros remotos. | Sí, con datos locales |
| Enviar diseño — revisión y envío | Revisar un diseño finalizado, elegir barbería y registrar el envío. | Diseños y envíos locales (`src/lib/envios.ts`); no inserta en `public.envios_diseno`. | Opera con estado local; no hay consulta Supabase para registrar o recuperar envíos. | Persistencia local o datos seleccionados no disponibles; el registro no se envía por Internet. | Sí, con datos locales |
| Panel de barbería — diseños recibidos | Mostrar los diseños recibidos por la barbería seleccionada. | Envíos locales; no consulta `public.envios_diseno`. | Filtra localmente los envíos por barbería seleccionada. | No refleja envíos remotos y puede no tener registros locales. | Sí, con datos locales |
| Citas de hoy — Barbero (vista documentada para el Hito 1) | Mostrar citas con hora, cliente, servicio, estado y acción. | No hay tabla de citas en el esquema vigente de Corte Ideal. | No existe consulta ni filtro/orden actual para esta vista. | Pertenece al modelo anterior documentado en `docs/ficha_negocio.md`, sección 7; no forma parte de la aplicación actual. | Fuera del alcance actual |
| Solicitar una cita — Cliente (vista documentada para el Hito 1) | Capturar nombre, servicio, fecha, hora y observaciones de una cita. | No hay tabla de citas en el esquema vigente de Corte Ideal. | No existe consulta ni filtro/orden actual para esta vista. | Vista del modelo anterior; el formulario actual personaliza cortes y no gestiona citas. | Fuera del alcance actual |
| Clientes (vista relacionada documentada para el Hito 1) | Explicar la asociación entre cliente y cita. | `public.clientes` existe, pero no hay una pantalla independiente de listado de clientes. | No existe consulta de pantalla actual ni filtro/orden implementado para esta vista. | La descripción de Hito 1 pertenece al modelo anterior; la tabla actual se usa mediante las relaciones y políticas del modelo de diseños. | Fuera del alcance actual |

La relación consultada en el detalle es la clave foránea `disenos_corte.id_estilo → estilos_base.id_estilo`. Las vistas del Hito 1 se identificaron en `docs/ficha_negocio.md`, sección 7, y describen el modelo anterior de citas; se conservan como referencia, no como funciones actuales. Las demás vistas se identificaron en los enlaces de navegación y secciones de `src/App.svelte`. Las fichas locales, barberías y envíos funcionan en el navegador. En Supabase, la aplicación consulta `estilos_base`, lista y muestra el detalle de los diseños autorizados, y permite crear diseños mediante la acción «Guardar en Supabase».

## 3. Matriz rol × tabla × operación

RLS está habilitado en las cinco tablas. La matriz registra únicamente las operaciones respaldadas por las políticas documentadas; una política SELECT no implica permisos de escritura.

| Rol/alcance | Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| Público (`anon`; lectura pública) | `estilos_base` | Permitido por política de lectura | No concedido/documentado | No concedido/documentado | No concedido/documentado |
| Público (`anon`; lectura pública) | `barberias` | Permitido por política de lectura | No concedido/documentado | No concedido/documentado | No concedido/documentado |
| Usuario autenticado | `clientes` | Política SELECT definida para el rol autenticado; el alcance de filas se aplica mediante RLS | No concedido/documentado | No concedido/documentado | No concedido/documentado |
| Usuario autenticado | `disenos_corte` | Permitido según la política SELECT propia, con alcance de filas aplicado por RLS | Permitido por la política INSERT para diseños cuyo `id_cliente` corresponde al usuario autenticado | No concedido/documentado | No concedido/documentado |
| Público y usuario autenticado | `envios_diseno` | Sin política SELECT documentada; RLS restringe el acceso | No concedido/documentado | No concedido/documentado | No concedido/documentado |

La política INSERT de `disenos_corte` permite crear diseños únicamente cuando el `id_cliente` indicado corresponde a un registro de `clientes` cuyo `usuario_id` coincide con `auth.uid()`. La lectura autenticada de diseños se limita igualmente mediante RLS. Las políticas SELECT públicas de `estilos_base` y `barberias` no otorgan permisos de escritura. No se documentan permisos UPDATE o DELETE, ni una política SELECT para `envios_diseno`.

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
| Cinco tablas del modelo y relaciones mediante claves foráneas | Completado | Contrato documentado en esta hoja y definido en `docs/hito2_esquema.sql`; evidencia del esquema y las relaciones: [Hito2_Demo1_01_Esquema_Supabase.png](./hito2_capturas/Hito2_Demo1_01_Esquema_Supabase.png) y [demostracion-1-esquema-relaciones.png](./hito2_capturas/demostracion-1-esquema-relaciones.png). |
| Interfaces TypeScript para las cinco tablas y uniones de estados | Completado | `src/tipos.ts` define `Cliente`, `EstiloBase`, `DisenoCorte`, `Barberia`, `EnvioDiseno`, `EstadoDiseno` y `EstadoEnvio`; evidencias: [Hito2_Demo1_02_Tipos_TypeScript.png](./hito2_capturas/Hito2_Demo1_02_Tipos_TypeScript.png) y [Hito2_Demo1_03_Tipos_TypeScript.png](./hito2_capturas/Hito2_Demo1_03_Tipos_TypeScript.png). |
| Lectura de `estilos_base` para el listado/selector | Completado | `obtenerEstilosBase()` está conectada al selector y la respuesta HTTP 200 con ocho registros fue comprobada en navegador. Evidencia: [demostracion-1-formulario-estilos-supabase.png](./hito2_capturas/demostracion-1-formulario-estilos-supabase.png). |
| RLS y políticas documentadas para las tablas del hito | Completado | Se documentan cuatro políticas SELECT y la política INSERT que limita la creación de diseños al cliente asociado a `auth.uid()`. Evidencias de políticas: [Hito2_Demo1_04_Politicas_RLS.png](./hito2_capturas/Hito2_Demo1_04_Politicas_RLS.png) y [Hito2_Demo1_05_Politicas_RLS.png](./hito2_capturas/Hito2_Demo1_05_Politicas_RLS.png). |
| RLS habilitado en las cinco tablas | Completado | Confirmado en el contexto del proyecto y contemplado en el esquema SQL. |
| Políticas públicas de lectura de `estilos_base` y `barberias` | Completado | Confirmadas para el proyecto Supabase. |
| Políticas SELECT para usuarios autenticados en `clientes` y `disenos_corte` | Completado | Confirmadas y utilizadas para mostrar el detalle relacionado con sesión autenticada, respetando RLS. |
| Política INSERT propia para `disenos_corte` | Completado | La política «Clientes crean sus propios disenos» comprueba que `id_cliente` corresponde al perfil con `usuario_id = auth.uid()`; no se documentan permisos UPDATE o DELETE. |
| Demostración 1 — Contrato de datos | Completado | Esquema, relaciones, interfaces y permisos actuales documentados. |
| Demostración 2 — Listado, detalle relacionado y HTTP 200 | Completado | Con sesión autenticada se lista lo permitido por RLS; «Ver detalle» consulta el diseño y su estilo relacionado. Las lecturas se comprobaron con HTTP 200. Evidencias: [demostracion-2-detalle-relacionado.png](./hito2_capturas/demostracion-2-detalle-relacionado.png) y [demostracion-2-network-http200.png](./hito2_capturas/demostracion-2-network-http200.png). |
| Demostración 3 — Validación del formulario | Completado | Los nombres obligatorios producen errores junto a los campos; al intentar el guardado remoto con datos inválidos no se genera POST a `disenos_corte`. Evidencias: [Hito2_Demo3_01_Validacion_Formulario.png](./hito2_capturas/Hito2_Demo3_01_Validacion_Formulario.png) y [Hito2_Demo3_02_Sin_INSERT.png](./hito2_capturas/Hito2_Demo3_02_Sin_INSERT.png). |
| Demostración 4 — Quién puede crear diseños | Completado | Sin sesión, la aplicación bloquea la acción remota. Con sesión y perfil de cliente asociado, permite la inserción autorizada; se comprobó HTTP 201 Created y se mostró el diseño con su estilo relacionado. Evidencias: [Hito2_Demo4_01_Sin_Sesion.png](./hito2_capturas/Hito2_Demo4_01_Sin_Sesion.png), [Hito2_Demo4_02_Con_Sesion.png](./hito2_capturas/Hito2_Demo4_02_Con_Sesion.png), [Hito2_Demo4_03_POST_201.png](./hito2_capturas/Hito2_Demo4_03_POST_201.png) y [Hito2_Demo4_04_Detalle_Relacionado.png](./hito2_capturas/Hito2_Demo4_04_Detalle_Relacionado.png). |

## Declaración de uso de inteligencia artificial

Se utilizaron ChatGPT y GitHub Copilot como herramientas de apoyo durante el desarrollo y la revisión del código, la implementación de funcionalidades, la identificación y corrección de errores, las validaciones y pruebas, y la preparación y organización de evidencias. Las funcionalidades descritas se comprobaron mediante pruebas reales de la aplicación y consultas a Supabase. Estas herramientas no sustituyen la revisión del equipo ni se presentan como responsables de ejecutar o verificar acciones que no estén documentadas.
