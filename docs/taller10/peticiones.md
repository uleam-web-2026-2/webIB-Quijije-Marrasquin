# Semana 10 — Registro de peticiones y pruebas

Las evidencias corresponden a pruebas realizadas manualmente. Los cuerpos de respuesta se reproducen solo cuando fueron registrados; no se infieren respuestas a partir del código HTTP ni del mensaje de la interfaz. No se incluyen encabezados de autorización, cookies ni tokens.

## Resultados

| Caso | Petición | Código HTTP | Cuerpo de la respuesta | Qué mostró la pantalla |
|---|---|---|---|---|
| 1 — PATCH autenticado con política UPDATE activa | `PATCH` a `public.disenos_corte` para el diseño de prueba, cambiando `estado_diseno` de `Borrador` a `Personalizado`. | `200 OK` | JSON con `id_diseno` del diseño solicitado y `estado_diseno: "Personalizado"`. | La actualización fue confirmada y el diseño apareció como `Personalizado`. Captura: [caso1.png](./capturas/caso1.png). |
| 2 — PATCH sin sesión | `PATCH` a `public.disenos_corte` sin sesión autenticada, usando solo la clave pública para identificar el proyecto. | `401 Unauthorized` | `{"code":"42501","details":null,"hint":"Grant the required privileges to the current role with: GRANT UPDATE ON public.disenos_corte TO anon;","message":"permission denied for table disenos_corte"}` | La petición fue rechazada por falta de privilegios. La petición manual no representa una actualización en la interfaz; esta requiere iniciar sesión. Capturas: [caso2.png](./capturas/caso2.png), [caso2_parte2.png](./capturas/caso2_parte2.png). |
| 3 — PATCH autenticado sin política RLS UPDATE | `PATCH` a la tabla aislada `prueba_rls_taller10`, con privilegios SQL concedidos pero sin política RLS UPDATE. Fue una prueba equivalente aislada; no se retiró la política de producción de `disenos_corte`. | `200 OK` | `[]` | La respuesta vacía no significó una actualización exitosa. Una consulta SQL posterior confirmó que el registro `id=1` seguía en `Borrador`. La prueba se verificó en Network y SQL Editor, no en la pantalla de diseños de producción. Capturas: [caso3.png](./capturas/caso3.png), [caso3_parte2.png](./capturas/caso3_parte2.png), [caso3_parte3.png](./capturas/caso3_parte3.png). |
| 4 — GET con token inválido tras recargar | Tras invalidar la sesión de prueba, se recargó la aplicación y se observaron las solicitudes de diseños, estilos, usuario y cierre de sesión. | `401` en `GET disenos_corte`; `401` en `GET estilos_base`; `403` en `GET user`; `403` en `POST logout`; posteriormente, `200` en otro `GET estilos_base`. | Los cuerpos de respuesta no se conservaron; no se reproducen ni se infieren. | Se mostró el formulario de inicio de sesión. La sesión inválida fue descartada y no se mostró acceso autenticado a los diseños. Captura: [caso4.png](./capturas/caso4.png). |
| 5 — PATCH desde una copia vieja | En dos pestañas con acceso autorizado al mismo diseño, una cambió el estado y la otra intentó guardar desde la copia cargada anteriormente. | No registrado; no se atribuye un código HTTP a este resultado. | No se registró el cuerpo HTTP. | La pestaña obsoleta mostró: “No se pudo confirmar la actualización: El diseño pudo cambiar desde que se cargó. Recarga los datos antes de volver a intentarlo.” La otra pestaña mostró el estado actualizado a `Borrador`. Capturas: [caso5.png](./capturas/caso5.png), [caso5_parte2.png](./capturas/caso5_parte2.png). |

## Interpretación de los casos

1. **Caso 1:** el servidor devolvió la fila modificada con el identificador solicitado y el nuevo estado; la interfaz confirmó la actualización.
2. **Caso 2:** el rol anónimo recibió `401` y el error `42501` por falta de privilegios de tabla. No se concedieron permisos para realizar la prueba.
3. **Caso 3:** la respuesta `200` con `[]` indicó que no se devolvieron filas modificadas; la consulta posterior confirmó que el valor permanecía en `Borrador`. Se utilizó una tabla aislada y no se alteraron las políticas de producción.
4. **Caso 4:** las solicitudes de autenticación fueron rechazadas con los códigos indicados; la aplicación presentó el inicio de sesión y no mantuvo el acceso autenticado a los diseños.
5. **Caso 5:** la interfaz no confirmó la escritura basada en la copia antigua y ofreció recargar. No se registró un código HTTP ni un cuerpo de respuesta para este intento.

## Alcance y seguridad de las pruebas

- El Caso 3 se ejecutó en la tabla aislada `prueba_rls_taller10`; no se retiró ni modificó la política UPDATE de `public.disenos_corte`.
- Para el Caso 5 se usaron dos pestañas autorizadas del mismo propietario, de modo que ambas pudieran acceder al diseño sin ampliar RLS.
- Las capturas son evidencias reales. Las imágenes complementarias (`parte2` y `parte3`) amplían la evidencia de su caso; no representan casos adicionales.
- No guardar ni compartir tokens, cookies ni encabezados `Authorization`.
