# Auditoría de accesibilidad — Semana 4

## 1. Lo que vio la herramienta

- Antes (listado de la semana 3): 95 / 100
- Hallazgo inicial: Background and foreground colors do not have a sufficient contrast ratio.
- Con el formulario recién agregado, primera pasada: 96 / 100
- Hallazgo en esa pasada: `p.etiqueta` dentro de `section.tarjeta.formulario-cita` tenía contraste insuficiente.
- Después de corregir el contraste: 100 / 100

## 2. Lo que no vio y cómo lo encontramos

- **Barrera 1:** El mensaje de error de cada campo obligatorio debía estar correctamente asociado al campo mediante `aria-describedby`.

	**A quién podía dejar afuera:** Personas que utilizan tecnologías de apoyo o lectores de pantalla.

	**Cómo la encontramos:** Revisando manualmente el panel Accessibility de Chrome DevTools y comprobando que el campo mostrara correctamente la propiedad Description con su mensaje de error.

- **Barrera 2:** El formulario debía poder recorrerse completamente con teclado, respetando un orden lógico y manteniendo siempre visible el foco.

	**A quién podía dejar afuera:** Personas que no utilizan ratón y navegan únicamente con teclado.

	**Cómo la encontramos:** Recargando la página y recorriendo los controles con la tecla Tab, sin hacer clic previamente, comprobando el orden: Nombre del cliente → Servicio → Fecha de la cita → Hora de la cita → Observaciones → Solicitar cita.

## 3. Después

- Después: 100 / 100
Informe: auditoria_despues.html

## 4. La paleta

- `a.accion-principal`:
	- Texto: `#0e2b27` → `#071c19`
	- Fondo: `#a77a2e`
	- Contraste: 3.923:1 → 4.597:1
	- Motivo: alcanzar el contraste mínimo requerido.

- `p.etiqueta`:
	- Texto: `#a77a2e` → `#9f6c2e`
	- Fondo: `#ffffff`
	- Contraste: 3.842:1 → 4.508:1
	- Aplica a:
		- `section.portada`
		- `section#citas.tarjeta`
		- `section#clientes.tarjeta`
		- `section.formulario-cita`
	- Motivo: alcanzar el contraste mínimo requerido sin cambiar la identidad visual.
