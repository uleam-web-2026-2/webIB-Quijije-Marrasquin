<script lang="ts">
  import { onMount } from 'svelte';
  import type { Session } from '@supabase/supabase-js';
  import Formulario from './Formulario.svelte';
  import { barberiasRegistradas } from './lib/data/barberias';
  import type { Barberia } from './lib/data/barberias';
  import {
    crearDisenoCorte,
    obtenerEstilosBase,
    obtenerDisenosAutorizados,
    obtenerDisenoConEstiloPorId,
    obtenerIdClientePorUsuario,
    type DisenoConEstilo,
  } from './lib/consultasSupabase';
  import { cargarEnvios, guardarEnvios, type EnvioDiseño } from './lib/envios';
  import {
    cargarDiseños,
    estaCompleto,
    guardarDiseños,
    type CaracteristicasDiseño,
    type DiseñoCorte,
    type EstadoDiseño,
  } from './lib/diseños';
  import type { DisenoCorte as DisenoCorteSupabase, EstiloBase } from './tipos';
  import { supabase } from './lib/supabase';

  let diseños = $state<DiseñoCorte[]>([]);
  let estilosBaseDisponibles = $state<EstiloBase[]>([]);
  let cargandoEstilos = $state(true);
  let errorEstilos = $state('');
  let disenosSupabase = $state<DisenoCorteSupabase[]>([]);
  let cargandoDisenosSupabase = $state(false);
  let errorDisenosSupabase = $state('');
  let detalleDiseno = $state<DisenoConEstilo | null>(null);
  let cargandoDetalle = $state(false);
  let errorDetalle = $state('');
  let idDisenoSeleccionado = $state<string | null>(null);
  let usuarioAutenticado = $state(false);
  let creandoDisenoSupabase = false;
  let correoSesion = $state('');
  let cargandoSesion = $state(true);
  let correoAcceso = $state('');
  let contrasenaAcceso = $state('');
  let procesandoAutenticacion = $state(false);
  let mensajeAutenticacion = $state('');
  let errorAutenticacion = $state(false);
  let userIdActivo: string | null = null;
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

  async function cargarEstilosSupabase(): Promise<void> {
    try {
      estilosBaseDisponibles = await obtenerEstilosBase();
    } catch (error) {
      errorEstilos = error instanceof Error
        ? `No se pudieron cargar los estilos desde Supabase: ${error.message}`
        : 'No se pudieron cargar los estilos desde Supabase.';
    } finally {
      cargandoEstilos = false;
    }
  }

  async function cargarDisenosSupabase(userId: string): Promise<void> {
    disenosSupabase = [];
    detalleDiseno = null;
    idDisenoSeleccionado = null;
    errorDisenosSupabase = '';
    errorDetalle = '';
    cargandoDisenosSupabase = true;
    cargandoDetalle = false;

    try {
      const resultados = await obtenerDisenosAutorizados();
      if (userId === userIdActivo) {
        disenosSupabase = resultados;
      }
    } catch (error) {
      if (userId === userIdActivo) {
        errorDisenosSupabase = error instanceof Error
          ? `No se pudieron cargar los diseños autorizados desde Supabase: ${error.message}`
          : 'No se pudieron cargar los diseños autorizados desde Supabase.';
      }
    } finally {
      if (userId === userIdActivo) {
        cargandoDisenosSupabase = false;
      }
    }
  }

  async function guardarDisenoSupabase(
    datos: CaracteristicasDiseño,
  ): Promise<{ diseno?: DisenoCorteSupabase; error?: string }> {
    if (creandoDisenoSupabase) {
      return { error: 'Ya se está procesando el guardado en Supabase.' };
    }

    creandoDisenoSupabase = true;
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        return { error: 'Inicia sesión con una cuenta autorizada para guardar en Supabase.' };
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user || userData.user.id !== sessionData.session.user.id) {
        return { error: 'No se pudo validar tu sesión. Inicia sesión nuevamente.' };
      }
      if (userData.user.id !== userIdActivo) {
        actualizarSesion(sessionData.session);
      }

      if (!datos.cliente.trim() || !datos.nombreDiseño.trim()) {
        return { error: 'El nombre del cliente y el nombre del diseño son obligatorios.' };
      }

      const estiloSeleccionado = datos.estiloBase.trim()
        ? estilosBaseDisponibles.find((estilo) => estilo.nombre === datos.estiloBase.trim())
        : undefined;
      if (datos.estiloBase.trim() && !estiloSeleccionado) {
        return {
          error: 'El estilo base seleccionado ya no está disponible. Selecciónalo de nuevo o déjalo vacío.',
        };
      }

      const idCliente = await obtenerIdClientePorUsuario(userData.user.id);
      if (!idCliente) {
        return {
          error: 'Tu cuenta no tiene un perfil de cliente asociado. Contacta al administrador.',
        };
      }

      const diseno = await crearDisenoCorte({
        id_cliente: idCliente,
        id_estilo: estiloSeleccionado?.id_estilo ?? null,
        nombre_diseno: datos.nombreDiseño.trim(),
        tipo_degradado: datos.tipoDegradado.trim() || null,
        longitud_superior: datos.longitudSuperior.trim() || null,
        textura: datos.textura.trim() || null,
        diseno_lateral: datos.diseñoLateral.trim() || null,
        terminacion_nuca: datos.terminacionNuca.trim() || null,
        estilo_barba: datos.estiloBarba.trim() || null,
        observaciones: datos.observaciones.trim() || null,
        estado_diseno: 'Borrador',
      });

      await cargarDisenosSupabase(userData.user.id);
      return { diseno };
    } catch (error) {
      return {
        error: error instanceof Error
          ? `No se pudo guardar el diseño en Supabase: ${error.message}`
          : 'No se pudo guardar el diseño en Supabase. Revisa tu conexión e inténtalo nuevamente.',
      };
    } finally {
      creandoDisenoSupabase = false;
    }
  }

  async function verDetalleDiseno(idDiseno: string): Promise<void> {
    const userId = userIdActivo;
    if (!userId) return;

    idDisenoSeleccionado = idDiseno;
    detalleDiseno = null;
    cargandoDetalle = true;
    errorDetalle = '';

    try {
      const resultado = await obtenerDisenoConEstiloPorId(idDiseno);
      if (userId === userIdActivo && idDiseno === idDisenoSeleccionado) {
        detalleDiseno = resultado;
      }
    } catch (error) {
      if (userId === userIdActivo && idDiseno === idDisenoSeleccionado) {
        errorDetalle = error instanceof Error
          ? `No se pudo cargar el detalle relacionado desde Supabase: ${error.message}`
          : 'No se pudo cargar el detalle relacionado desde Supabase.';
      }
    } finally {
      if (userId === userIdActivo && idDiseno === idDisenoSeleccionado) {
        cargandoDetalle = false;
      }
    }
  }

  function actualizarSesion(session: Session | null): void {
    const nuevoUserId = session?.user.id ?? null;
    usuarioAutenticado = nuevoUserId !== null;
    correoSesion = session?.user.email ?? '';

    if (nuevoUserId === userIdActivo) return;
    userIdActivo = nuevoUserId;

    if (nuevoUserId) {
      void cargarDisenosSupabase(nuevoUserId);
    } else {
      disenosSupabase = [];
      cargandoDisenosSupabase = false;
      errorDisenosSupabase = '';
      detalleDiseno = null;
      idDisenoSeleccionado = null;
      errorDetalle = '';
      cargandoDetalle = false;
    }
  }

  function explicarErrorAutenticacion(error: Error): string {
    const mensaje = error.message.toLowerCase();
    if (mensaje.includes('invalid login credentials')) {
      return 'El correo o la contraseña no son correctos.';
    }
    if (mensaje.includes('email not confirmed')) {
      return 'Confirma tu correo antes de iniciar sesión.';
    }
    return `No se pudo completar la autenticación: ${error.message}`;
  }

  async function iniciarSesion(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    procesandoAutenticacion = true;
    mensajeAutenticacion = '';
    errorAutenticacion = false;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correoAcceso.trim(),
        password: contrasenaAcceso,
      });

      if (error) throw error;
      actualizarSesion(data.session);
      contrasenaAcceso = '';
      mensajeAutenticacion = 'Sesión iniciada correctamente.';
    } catch (error) {
      errorAutenticacion = true;
      mensajeAutenticacion = error instanceof Error
        ? explicarErrorAutenticacion(error)
        : 'No se pudo iniciar sesión. Revisa tus credenciales e inténtalo nuevamente.';
    } finally {
      procesandoAutenticacion = false;
    }
  }

  async function cerrarSesion(): Promise<void> {
    procesandoAutenticacion = true;
    mensajeAutenticacion = '';
    errorAutenticacion = false;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      actualizarSesion(null);
      mensajeAutenticacion = 'Sesión cerrada correctamente.';
    } catch (error) {
      errorAutenticacion = true;
      mensajeAutenticacion = error instanceof Error
        ? explicarErrorAutenticacion(error)
        : 'No se pudo cerrar la sesión. Inténtalo nuevamente.';
    } finally {
      procesandoAutenticacion = false;
    }
  }

  onMount(() => {
    void cargarEstilosSupabase();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        actualizarSesion(session);
        cargandoSesion = false;
      });
    });

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        actualizarSesion(data.session);
      })
      .catch((error: unknown) => {
        errorAutenticacion = true;
        mensajeAutenticacion = error instanceof Error
          ? explicarErrorAutenticacion(error)
          : 'No se pudo recuperar la sesión.';
      })
      .finally(() => {
        cargandoSesion = false;
      });

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

    return () => authListener.subscription.unsubscribe();
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
      estilosBaseDisponibles={estilosBaseDisponibles}
      cargandoEstilos={cargandoEstilos}
      errorEstilos={errorEstilos}
      onGuardar={guardarDiseño}
      onGuardarSupabase={guardarDisenoSupabase}
    />

    <section id="acceso" class="tarjeta formulario-diseno" aria-labelledby="titulo-acceso">
      <p class="etiqueta">CUENTA DE CLIENTE</p>
      <h2 id="titulo-acceso">{usuarioAutenticado ? 'Sesión activa' : 'Iniciar sesión'}</h2>
      {#if cargandoSesion}
        <p role="status">Comprobando sesión...</p>
      {:else if usuarioAutenticado}
        <p>Sesión iniciada como {correoSesion}.</p>
        <button
          class="accion-seleccion"
          type="button"
          onclick={cerrarSesion}
          disabled={procesandoAutenticacion}
        >
          {procesandoAutenticacion ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      {:else}
        <form onsubmit={iniciarSesion}>
          <div class="campo-formulario">
            <label for="correo-acceso">Correo electrónico</label>
            <input
              id="correo-acceso"
              name="email"
              type="email"
              autocomplete="username"
              required
              bind:value={correoAcceso}
            />
          </div>
          <div class="campo-formulario">
            <label for="contrasena-acceso">Contraseña</label>
            <input
              id="contrasena-acceso"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              bind:value={contrasenaAcceso}
            />
          </div>
          <button type="submit" disabled={procesandoAutenticacion}>
            {procesandoAutenticacion ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      {/if}
      {#if mensajeAutenticacion}
        <p class={errorAutenticacion ? 'mensaje-error' : ''} role={errorAutenticacion ? 'alert' : 'status'}>
          {mensajeAutenticacion}
        </p>
      {/if}
    </section>

    {#if !cargandoSesion && usuarioAutenticado}
      <section id="disenos-supabase" class="tarjeta" aria-labelledby="titulo-disenos-supabase">
        <div class="cabecera-seccion">
          <div>
            <p class="etiqueta">DATOS AUTORIZADOS POR SUPABASE</p>
            <h2 id="titulo-disenos-supabase">Diseños de Supabase</h2>
          </div>
        </div>

        {#if cargandoDisenosSupabase}
          <p role="status">Cargando diseños desde Supabase...</p>
        {:else if errorDisenosSupabase}
          <p class="mensaje-error" role="alert">{errorDisenosSupabase}</p>
        {:else if disenosSupabase.length === 0}
          <p role="status">No hay diseños autorizados disponibles para esta cuenta.</p>
        {:else}
          <div class="tabla-scroll">
            <table>
              <caption>Diseños obtenidos de Supabase y visibles según las políticas RLS</caption>
              <thead>
                <tr>
                  <th scope="col">Diseño</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Creado</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {#each disenosSupabase as diseno (diseno.id_diseno)}
                  <tr>
                    <td data-label="Diseño">{diseno.nombre_diseno}</td>
                    <td data-label="Estado">{diseno.estado_diseno}</td>
                    <td data-label="Creado">{new Date(diseno.creado_en).toLocaleString()}</td>
                    <td data-label="Acción">
                      <button
                        class="accion-seleccion"
                        type="button"
                        aria-pressed={idDisenoSeleccionado === diseno.id_diseno}
                        disabled={cargandoDetalle}
                        onclick={() => verDetalleDiseno(diseno.id_diseno)}
                      >
                        {idDisenoSeleccionado === diseno.id_diseno && cargandoDetalle
                          ? 'Cargando detalle...'
                          : 'Ver detalle'}
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        {#if errorDetalle}
          <p class="mensaje-error" role="alert">{errorDetalle}</p>
        {:else if cargandoDetalle}
          <p role="status">Cargando detalle relacionado desde Supabase...</p>
        {:else if idDisenoSeleccionado && !detalleDiseno}
          <p role="status">El diseño seleccionado ya no está disponible para esta cuenta.</p>
        {:else if detalleDiseno}
          <article class="tarjeta" aria-labelledby="titulo-registro-relacionado">
            <p class="etiqueta">DETALLE RELACIONADO</p>
            <h2 id="titulo-registro-relacionado">{detalleDiseno.nombre_diseno}</h2>
            <p><strong>Estado:</strong> {detalleDiseno.estado_diseno}</p>
            <p><strong>Estilo base:</strong> {detalleDiseno.estilos_base?.nombre ?? 'Sin estilo relacionado'}</p>
            {#if detalleDiseno.estilos_base}
              <p><strong>Descripción del estilo:</strong> {detalleDiseno.estilos_base.descripcion}</p>
            {/if}
            <p><strong>Degradado:</strong> {detalleDiseno.tipo_degradado ?? 'No especificado'}</p>
            <p><strong>Longitud superior:</strong> {detalleDiseno.longitud_superior ?? 'No especificada'}</p>
            <p><strong>Textura:</strong> {detalleDiseno.textura ?? 'No especificada'}</p>
            <p><strong>Diseño lateral:</strong> {detalleDiseno.diseno_lateral ?? 'No especificado'}</p>
            <p><strong>Terminación de nuca:</strong> {detalleDiseno.terminacion_nuca ?? 'No especificada'}</p>
            <p><strong>Estilo de barba:</strong> {detalleDiseno.estilo_barba ?? 'No especificado'}</p>
            <p><strong>Observaciones:</strong> {detalleDiseno.observaciones ?? 'Sin observaciones'}</p>
          </article>
        {/if}
      </section>
    {/if}

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
