<script lang="ts">
  import { onMount } from 'svelte';
  import Formulario from './Formulario.svelte';
  import { barberiasRegistradas } from './lib/data/barberias';
  import type { Barberia } from './lib/data/barberias';
  import { cargarEnvios, guardarEnvios, type EnvioDiseño } from './lib/envios';
  import {
    cargarDiseños,
    estaCompleto,
    guardarDiseños,
    type CaracteristicasDiseño,
    type DiseñoCorte,
    type EstadoDiseño,
  } from './lib/diseños';

  let diseños = $state<DiseñoCorte[]>([]);
  let diseñoSeleccionado = $state<DiseñoCorte | null>(null);
  let versionFormulario = $state(0);
  let errorAlmacenamiento = $state('');
  let barberiaSeleccionadaId = $state<string | null>(null);
  let mensajeBarberia = $state('');
  let envios = $state<EnvioDiseño[]>([]);
  let diseñoParaEnviarId = $state('');
  let barberiaPanelId = $state('');
  let enviosRecibidos = $derived(
    envios.filter((envio) => envio.idBarberia === barberiaPanelId),
  );
  let mensajeEnvio = $state('');
  let errorEnvio = $state(false);

  onMount(() => {
    try {
      diseños = cargarDiseños();
    } catch (error) {
      errorAlmacenamiento = error instanceof Error
        ? `No se pudieron cargar los diseños guardados: ${error.message}`
        : 'No se pudieron cargar los diseños guardados.';
    }

    try {
      envios = cargarEnvios();
      const idGuardado = localStorage.getItem('corte-ideal-barberia-seleccionada-v1');
      barberiaSeleccionadaId = barberiasRegistradas.some(
        (barberia) => barberia.idBarberia === idGuardado,
      )
        ? idGuardado
        : null;
      barberiaPanelId = barberiaSeleccionadaId ?? barberiasRegistradas[0]?.idBarberia ?? '';
    } catch (error) {
      errorEnvio = true;
      mensajeEnvio = error instanceof Error
        ? `No se pudieron cargar los envíos locales: ${error.message}`
        : 'No se pudieron cargar los envíos locales.';
    }
  });

  function guardarDiseño(
    datos: CaracteristicasDiseño,
    id: string | null,
    finalizar: boolean,
  ): { diseño?: DiseñoCorte; error?: string } {
    if (!datos.cliente.trim() || !datos.nombreDiseño.trim()) {
      return { error: 'El nombre del cliente y el nombre del diseño son obligatorios.' };
    }
    if (finalizar && !estaCompleto(datos)) {
      return { error: 'Completa todas las características antes de finalizar el diseño.' };
    }

    const existente = id ? diseños.find((diseño) => diseño.id === id) : undefined;
    if (id && !existente) {
      return { error: 'No se encontró el diseño que intentas editar.' };
    }
    if (existente?.estado === 'Finalizado') {
      return { error: 'Los diseños finalizados no se pueden modificar.' };
    }

    const ahora = new Date().toISOString();
    const diseñoGuardado: DiseñoCorte = {
      ...datos,
      cliente: datos.cliente.trim(),
      nombreDiseño: datos.nombreDiseño.trim(),
      id: existente?.id ?? crypto.randomUUID(),
      estado: finalizar ? 'Finalizado' : estaCompleto(datos) ? 'Personalizado' : 'Borrador',
      creadoEn: existente?.creadoEn ?? ahora,
      actualizadoEn: ahora,
    };
    const siguientesDiseños = existente
      ? diseños.map((diseño) => diseño.id === existente.id ? diseñoGuardado : diseño)
      : [diseñoGuardado, ...diseños];

    try {
      guardarDiseños(siguientesDiseños);
      diseños = siguientesDiseños;
      errorAlmacenamiento = '';
      return { diseño: diseñoGuardado };
    } catch (error) {
      return {
        error: error instanceof Error
          ? `No se pudo guardar el diseño en este dispositivo: ${error.message}`
          : 'No se pudo guardar el diseño en este dispositivo.',
      };
    }
  }

  function seleccionarParaEditar(diseño: DiseñoCorte): void {
    if (diseño.estado !== 'Finalizado') {
      diseñoSeleccionado = diseño;
      document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function crearNuevoDiseño(): void {
    diseñoSeleccionado = null;
    versionFormulario += 1;
  }

  function seleccionarBarberia(barberia: Barberia): void {
    try {
      localStorage.setItem('corte-ideal-barberia-seleccionada-v1', barberia.idBarberia);
      barberiaSeleccionadaId = barberia.idBarberia;
      barberiaPanelId = barberia.idBarberia;
      mensajeBarberia = `Barbería seleccionada: ${barberia.nombre}.`;
    } catch (error) {
      mensajeBarberia = error instanceof Error
        ? `No se pudo guardar la selección: ${error.message}`
        : 'No se pudo guardar la selección de barbería.';
    }
  }

  function confirmarEnvio(): void {
    errorEnvio = true;
    mensajeEnvio = '';

    const diseño = diseños.find((item) => item.id === diseñoParaEnviarId);
    if (!diseño || diseño.estado !== 'Finalizado' || !diseño.cliente.trim()) {
      mensajeEnvio = 'Selecciona un diseño finalizado que tenga un cliente asociado.';
      return;
    }

    const barberia = barberiasRegistradas.find(
      (item) => item.idBarberia === barberiaSeleccionadaId,
    );
    if (!barberia) {
      mensajeEnvio = 'Selecciona una barbería registrada antes de confirmar el envío.';
      return;
    }

    const envio: EnvioDiseño = {
      idEnvio: crypto.randomUUID(),
      idDiseño: diseño.id,
      idBarberia: barberia.idBarberia,
      fechaEnvio: new Date().toISOString(),
      estadoEnvio: 'Recibido',
      respuesta: '',
      copiaDiseño: {
        cliente: diseño.cliente,
        nombreDiseño: diseño.nombreDiseño,
        estiloBase: diseño.estiloBase,
        tipoDegradado: diseño.tipoDegradado,
        longitudSuperior: diseño.longitudSuperior,
        textura: diseño.textura,
        diseñoLateral: diseño.diseñoLateral,
        terminacionNuca: diseño.terminacionNuca,
        estiloBarba: diseño.estiloBarba,
        observaciones: diseño.observaciones,
      },
    };

    const siguientesEnvios = [envio, ...envios];
    try {
      guardarEnvios(siguientesEnvios);
      envios = siguientesEnvios;
      barberiaPanelId = barberia.idBarberia;
      mensajeEnvio = 'Tu diseño quedó registrado en este navegador. No se ha enviado por Internet a la barbería.';
      errorEnvio = false;
    } catch (error) {
      mensajeEnvio = error instanceof Error
        ? `No se pudo guardar el envío en este navegador: ${error.message}`
        : 'No se pudo guardar el envío en este navegador.';
    }
  }

  function claseEstado(estado: EstadoDiseño): string {
    if (estado === 'Finalizado') return 'estado-finalizado';
    if (estado === 'Personalizado') return 'estado-personalizado';
    return 'estado-borrador';
  }
</script>

<div class="lamina">
  <header class="cabecera">
    <div class="marca">
      <p class="marca-nombre"><strong>Corte Ideal</strong></p>
      <p class="marca-local">Diseña tu propio estilo</p>
    </div>

    <nav class="menu" aria-label="Navegación principal">
      <ul>
        <li><a href="#disenos" aria-current="page">Mis diseños</a></li>
        <li><a href="#formulario">Personalizar corte</a></li>
        <li><a href="#barberias">Barberías</a></li>
        <li><a href="#envio">Enviar diseño</a></li>
        <li><a href="#panel-barberia">Panel de barbería</a></li>
      </ul>
    </nav>

    <a class="accion-principal" href="#formulario" onclick={crearNuevoDiseño}>Crear diseño</a>
  </header>

  <main class="contenido">
    <section class="portada" aria-labelledby="titulo-principal">
      <p class="etiqueta">DISEÑA TU PROPIO ESTILO</p>
      <h1 id="titulo-principal">Personaliza el corte que tienes en mente</h1>
      <p class="portada-texto">
        Define cada característica de tu corte y guarda una ficha textual clara
        para comunicar tus preferencias.
      </p>
    </section>

    {#if errorAlmacenamiento}
      <p class="mensaje-error" role="alert">{errorAlmacenamiento}</p>
    {/if}

    <Formulario
      diseñoSeleccionado={diseñoSeleccionado}
      versionFormulario={versionFormulario}
      onGuardar={guardarDiseño}
    />

    <section id="barberias" class="tarjeta" aria-labelledby="titulo-barberias">
      <div class="cabecera-seccion">
        <div>
          <p class="etiqueta">BARBERÍAS REGISTRADAS</p>
          <h2 id="titulo-barberias">Selecciona una barbería</h2>
        </div>
        <span class="estado-diseño">{barberiasRegistradas.length} barberías</span>
      </div>
      {#if mensajeBarberia}
        <p role="status">{mensajeBarberia}</p>
      {/if}
      <div class="tabla-scroll">
        <table>
          <caption>Barberías disponibles para compartir un diseño</caption>
          <thead>
            <tr>
              <th scope="col">Barbería</th>
              <th scope="col">Ubicación</th>
              <th scope="col">Descripción</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {#each barberiasRegistradas as barberia (barberia.idBarberia)}
              <tr>
                <td data-label="Barbería">{barberia.nombre}</td>
                <td data-label="Ubicación">{barberia.ubicacion}</td>
                <td data-label="Descripción">{barberia.descripcion}</td>
                <td data-label="Acción">
                  <button
                    class="accion-seleccion"
                    type="button"
                    aria-pressed={barberiaSeleccionadaId === barberia.idBarberia}
                    onclick={() => seleccionarBarberia(barberia)}
                  >
                    {barberiaSeleccionadaId === barberia.idBarberia ? 'Seleccionada' : 'Seleccionar'}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <section id="envio" class="tarjeta" aria-labelledby="titulo-envio">
      <div class="cabecera-seccion">
        <div>
          <p class="etiqueta">COMPARTIR TU DISEÑO</p>
          <h2 id="titulo-envio">Revisar y enviar</h2>
        </div>
      </div>

      <div class="campo-formulario">
        <label for="diseno-para-enviar">Diseño finalizado</label>
        <select id="diseno-para-enviar" bind:value={diseñoParaEnviarId}>
          <option value="">Selecciona un diseño finalizado</option>
          {#each diseños.filter((diseño) => diseño.estado === 'Finalizado') as diseño (diseño.id)}
            <option value={diseño.id}>{diseño.nombreDiseño} — {diseño.cliente}</option>
          {/each}
        </select>
      </div>

      {#if diseñoParaEnviarId}
        {@const diseñoRevisado = diseños.find((diseño) => diseño.id === diseñoParaEnviarId)}
        {@const barberiaRevisada = barberiasRegistradas.find(
          (barberia) => barberia.idBarberia === barberiaSeleccionadaId,
        )}
        {#if diseñoRevisado}
          <article class="tarjeta" aria-labelledby="titulo-resumen-envio">
            <p class="etiqueta">RESUMEN DEL ENVÍO</p>
            <h2 id="titulo-resumen-envio">{diseñoRevisado.nombreDiseño}</h2>
            <p><strong>Cliente:</strong> {diseñoRevisado.cliente}</p>
            <p><strong>Estilo base:</strong> {diseñoRevisado.estiloBase}</p>
            <p><strong>Tipo de degradado:</strong> {diseñoRevisado.tipoDegradado}</p>
            <p><strong>Longitud superior:</strong> {diseñoRevisado.longitudSuperior}</p>
            <p><strong>Textura:</strong> {diseñoRevisado.textura}</p>
            <p><strong>Diseño lateral:</strong> {diseñoRevisado.diseñoLateral}</p>
            <p><strong>Terminación de nuca:</strong> {diseñoRevisado.terminacionNuca}</p>
            <p><strong>Estilo de barba:</strong> {diseñoRevisado.estiloBarba}</p>
            <p><strong>Observaciones:</strong> {diseñoRevisado.observaciones || 'Sin observaciones'}</p>
            <p>
              <strong>Barbería:</strong>
              {barberiaRevisada
                ? `${barberiaRevisada.nombre} — ${barberiaRevisada.ubicacion}`
                : 'Selecciona una barbería en la lista anterior.'}
            </p>
          </article>
        {/if}
      {/if}

      <button class="accion-seleccion" type="button" onclick={confirmarEnvio}>Enviar diseño</button>
      {#if mensajeEnvio}
        <p class={errorEnvio ? 'mensaje-error' : ''} role={errorEnvio ? 'alert' : 'status'}>
          {mensajeEnvio}
        </p>
      {/if}
    </section>

    <section id="panel-barberia" class="tarjeta" aria-labelledby="titulo-panel-barberia">
      <div class="cabecera-seccion">
        <div>
          <p class="etiqueta">DISEÑOS RECIBIDOS</p>
          <h2 id="titulo-panel-barberia">Panel de barbería</h2>
        </div>
      </div>
      <div class="campo-formulario">
        <label for="barberia-panel">Barbería destinataria</label>
        <select id="barberia-panel" bind:value={barberiaPanelId}>
          {#each barberiasRegistradas as barberia (barberia.idBarberia)}
            <option value={barberia.idBarberia}>{barberia.nombre}</option>
          {/each}
        </select>
      </div>

      {#if enviosRecibidos.length === 0}
        <p>Esta barbería todavía no tiene diseños recibidos.</p>
      {:else}
        {#each enviosRecibidos as envio (envio.idEnvio)}
          {@const barberiaDestinataria = barberiasRegistradas.find(
            (barberia) => barberia.idBarberia === envio.idBarberia,
          )}
          <article class="tarjeta" aria-labelledby={`envio-${envio.idEnvio}`}>
            <div class="cabecera-seccion">
              <div>
                <p class="etiqueta">DISEÑO RECIBIDO · {barberiaDestinataria?.nombre}</p>
                <h2 id={`envio-${envio.idEnvio}`}>{envio.copiaDiseño.nombreDiseño}</h2>
              </div>
              <span class="estado estado-personalizado">{envio.estadoEnvio}</span>
            </div>
            <p><strong>Cliente:</strong> {envio.copiaDiseño.cliente}</p>
            <p><strong>Estilo base:</strong> {envio.copiaDiseño.estiloBase}</p>
            <p><strong>Tipo de degradado:</strong> {envio.copiaDiseño.tipoDegradado}</p>
            <p><strong>Longitud superior:</strong> {envio.copiaDiseño.longitudSuperior}</p>
            <p><strong>Textura:</strong> {envio.copiaDiseño.textura}</p>
            <p><strong>Diseño lateral:</strong> {envio.copiaDiseño.diseñoLateral}</p>
            <p><strong>Terminación de nuca:</strong> {envio.copiaDiseño.terminacionNuca}</p>
            <p><strong>Estilo de barba:</strong> {envio.copiaDiseño.estiloBarba}</p>
            <p><strong>Observaciones:</strong> {envio.copiaDiseño.observaciones || 'Sin observaciones'}</p>
            <p>
              <strong>Fecha de envío:</strong>
              {new Intl.DateTimeFormat('es-EC', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(envio.fechaEnvio))}
              <span> (registro histórico; no es una cita ni una reserva)</span>
            </p>
          </article>
        {/each}
      {/if}
    </section>

    <section id="disenos" class="tarjeta" aria-labelledby="titulo-disenos">
      <div class="cabecera-seccion">
        <div>
          <p class="etiqueta">TUS FICHAS DE CORTE</p>
          <h2 id="titulo-disenos">Diseños guardados</h2>
        </div>
        <span class="estado-diseño">
          {diseños.length} {diseños.length === 1 ? 'diseño' : 'diseños'}
        </span>
      </div>

      {#if diseños.length === 0}
        <p>Aún no hay diseños guardados. Completa el formulario para crear tu primera ficha.</p>
      {:else}
        {#each diseños as diseño (diseño.id)}
          <article class="tarjeta" aria-labelledby={`titulo-${diseño.id}`}>
            <div class="cabecera-seccion">
              <div>
                <p class="etiqueta">DISEÑO DE {diseño.cliente}</p>
                <h2 id={`titulo-${diseño.id}`}>{diseño.nombreDiseño}</h2>
              </div>
              <span class={`estado ${claseEstado(diseño.estado)}`}>{diseño.estado}</span>
            </div>

            <p><strong>Estilo base:</strong> {diseño.estiloBase || 'Sin seleccionar'}</p>
            <p><strong>Tipo de degradado:</strong> {diseño.tipoDegradado || 'Sin seleccionar'}</p>
            <p><strong>Longitud superior:</strong> {diseño.longitudSuperior || 'Sin seleccionar'}</p>
            <p><strong>Textura:</strong> {diseño.textura || 'Sin seleccionar'}</p>
            <p><strong>Diseño lateral:</strong> {diseño.diseñoLateral || 'Sin seleccionar'}</p>
            <p><strong>Terminación de nuca:</strong> {diseño.terminacionNuca || 'Sin seleccionar'}</p>
            <p><strong>Estilo de barba:</strong> {diseño.estiloBarba || 'Sin seleccionar'}</p>
            <p><strong>Observaciones:</strong> {diseño.observaciones || 'Sin observaciones'}</p>

            {#if diseño.estado !== 'Finalizado'}
              <a href="#formulario" onclick={() => seleccionarParaEditar(diseño)}>Editar diseño</a>
            {:else}
              <p>Este diseño está finalizado y no se puede modificar.</p>
            {/if}
          </article>
        {/each}
      {/if}
    </section>
  </main>

  <footer class="pie">
    <p>Corte Ideal · Diseña tu propio estilo</p>
    <p>Tu estilo, descrito con tus propias preferencias.</p>
  </footer>
</div>
