<script lang="ts">
  import { onMount } from 'svelte';
  import {
    diseñoVacio,
    diseñosLaterales,
    estilosBarba,
    estaCompleto,
    longitudesSuperiores,
    terminacionesNuca,
    texturas,
    tiposDegradado,
    type CaracteristicasDiseño,
    type DiseñoCorte,
  } from './lib/diseños';
  import type { DisenoCorte as DisenoCorteSupabase, EstiloBase } from './tipos';

  const claveBorrador = 'corte-ideal-borrador-formulario-v1';

  interface BorradorSesion {
    estiloBase: string;
    tipoDegradado: string;
    longitudSuperior: string;
    textura: string;
    diseñoLateral: string;
    terminacionNuca: string;
    estiloBarba: string;
  }

  interface ResultadoGuardado {
    diseño?: DiseñoCorte;
    error?: string;
  }

  interface ResultadoGuardadoSupabase {
    diseno?: DisenoCorteSupabase;
    error?: string;
  }

  let {
    diseñoSeleccionado,
    versionFormulario,
    estilosBaseDisponibles,
    cargandoEstilos,
    errorEstilos,
    onGuardar,
    onGuardarSupabase,
  }: {
    diseñoSeleccionado: DiseñoCorte | null;
    versionFormulario: number;
    estilosBaseDisponibles: EstiloBase[];
    cargandoEstilos: boolean;
    errorEstilos: string;
    onGuardar: (
      diseño: CaracteristicasDiseño,
      id: string | null,
      finalizar: boolean,
    ) => ResultadoGuardado;
    onGuardarSupabase: (
      diseño: CaracteristicasDiseño,
    ) => Promise<ResultadoGuardadoSupabase>;
  } = $props();

  let formulario = $state<CaracteristicasDiseño>(diseñoVacio());
  let idEdicion = $state<string | null>(null);
  let mensaje = $state('');
  let esError = $state(false);
  let intentoGuardar = $state(false);
  let intentoFinalizar = $state(false);
  let intentoGuardarSupabase = $state(false);
  let procesandoGuardadoSupabase = $state(false);
  let borradorListo = $state(false);
  let errorBorrador = $state('');
  let versionBorrador = $state(0);
  let omitirPersistenciaBorrador = false;
  let ultimaVersionFormulario = 0;

  function esOpcion<T extends readonly string[]>(valor: unknown, opciones: T): valor is T[number] {
    return typeof valor === 'string' && opciones.includes(valor);
  }

  function esBorradorSesion(valor: unknown): valor is BorradorSesion {
    if (typeof valor !== 'object' || valor === null) return false;
    const borrador = valor as Record<string, unknown>;
    const campos = [
      'estiloBase',
      'tipoDegradado',
      'longitudSuperior',
      'textura',
      'diseñoLateral',
      'terminacionNuca',
      'estiloBarba',
    ];
    return Object.keys(borrador).length === campos.length &&
      campos.every((campo) => campo in borrador) &&
      typeof borrador.estiloBase === 'string' &&
      (borrador.tipoDegradado === '' || esOpcion(borrador.tipoDegradado, tiposDegradado)) &&
      (borrador.longitudSuperior === '' || esOpcion(borrador.longitudSuperior, longitudesSuperiores)) &&
      (borrador.textura === '' || esOpcion(borrador.textura, texturas)) &&
      (borrador.diseñoLateral === '' || esOpcion(borrador.diseñoLateral, diseñosLaterales)) &&
      (borrador.terminacionNuca === '' || esOpcion(borrador.terminacionNuca, terminacionesNuca)) &&
      (borrador.estiloBarba === '' || esOpcion(borrador.estiloBarba, estilosBarba));
  }

  function limpiarBorradorSesion(): void {
    try {
      sessionStorage.removeItem(claveBorrador);
      errorBorrador = '';
      omitirPersistenciaBorrador = true;
      versionBorrador += 1;
    } catch (error) {
      errorBorrador = error instanceof Error
        ? `El diseño se guardó, pero no se pudo limpiar el borrador de esta pestaña: ${error.message}`
        : 'El diseño se guardó, pero no se pudo limpiar el borrador de esta pestaña.';
    }
  }

  onMount(() => {
    try {
      const guardado = sessionStorage.getItem(claveBorrador);
      if (guardado !== null) {
        const datos: unknown = JSON.parse(guardado);
        if (!esBorradorSesion(datos)) {
          throw new Error('El borrador guardado tiene un formato no válido.');
        }
        formulario = { ...formulario, ...datos };
      }
    } catch (error) {
      errorBorrador = error instanceof Error
        ? `No se pudo restaurar el borrador de esta pestaña: ${error.message}`
        : 'No se pudo restaurar el borrador de esta pestaña.';
    } finally {
      borradorListo = true;
    }
  });

  $effect(() => {
    versionBorrador;
    const borrador: BorradorSesion = {
      estiloBase: formulario.estiloBase,
      tipoDegradado: formulario.tipoDegradado,
      longitudSuperior: formulario.longitudSuperior,
      textura: formulario.textura,
      diseñoLateral: formulario.diseñoLateral,
      terminacionNuca: formulario.terminacionNuca,
      estiloBarba: formulario.estiloBarba,
    };
    if (!borradorListo) return;
    if (omitirPersistenciaBorrador) {
      omitirPersistenciaBorrador = false;
      return;
    }

    try {
      sessionStorage.setItem(claveBorrador, JSON.stringify(borrador));
      errorBorrador = '';
    } catch (error) {
      errorBorrador = error instanceof Error
        ? `No se pudo guardar el borrador de esta pestaña: ${error.message}`
        : 'No se pudo guardar el borrador de esta pestaña.';
    }
  });

  $effect(() => {
    const diseño = diseñoSeleccionado;
    if (diseño) {
      formulario = {
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
      };
      idEdicion = diseño.id;
      mensaje = '';
      esError = false;
      intentoGuardar = false;
      intentoFinalizar = false;
      intentoGuardarSupabase = false;
      ultimaVersionFormulario = versionFormulario;
    } else if (versionFormulario !== ultimaVersionFormulario) {
      formulario = diseñoVacio();
      idEdicion = null;
      mensaje = '';
      esError = false;
      intentoGuardar = false;
      intentoFinalizar = false;
      intentoGuardarSupabase = false;
      ultimaVersionFormulario = versionFormulario;
    }
  });

  function campoInvalido(valor: string): boolean {
    return intentoGuardar && !valor.trim();
  }

  function caracteristicaInvalida(valor: string): boolean {
    return intentoFinalizar && !valor.trim();
  }

  function estiloBaseSupabaseInvalido(): boolean {
    return intentoGuardarSupabase &&
      Boolean(formulario.estiloBase.trim()) &&
      !estilosBaseDisponibles.some(
        (estilo) => estilo.nombre === formulario.estiloBase.trim(),
      );
  }

  function enviarFormulario(evento: SubmitEvent): void {
    evento.preventDefault();
    const accion = evento.submitter instanceof HTMLButtonElement
      ? evento.submitter.value
      : 'guardar';

    if (accion === 'guardar-supabase') {
      void guardarEnSupabase();
      return;
    }

    intentoGuardarSupabase = false;
    intentoGuardar = true;
    esError = true;
    const finalizar = accion === 'finalizar';
    intentoFinalizar = finalizar;

    const datosBasicosValidos = Boolean(
      formulario.cliente.trim() && formulario.nombreDiseño.trim(),
    );
    const caracteristicasValidas = !finalizar || estaCompleto(formulario);
    if (!datosBasicosValidos || !caracteristicasValidas) {
      mensaje = !datosBasicosValidos
        ? 'Escribe el nombre del cliente y el nombre del diseño para guardarlo.'
        : 'Completa todas las características obligatorias antes de finalizar el diseño.';
      return;
    }

    const resultado = onGuardar(formulario, idEdicion, finalizar);
    if (resultado.error || !resultado.diseño) {
      mensaje = resultado.error ?? 'No se pudo guardar el diseño.';
      return;
    }

    esError = false;
    intentoGuardar = false;
    intentoFinalizar = false;
    if (finalizar) {
      limpiarBorradorSesion();
      formulario = diseñoVacio();
      idEdicion = null;
      mensaje = 'Diseño finalizado correctamente. Ya está preparado para enviarse.';
    } else {
      limpiarBorradorSesion();
      formulario = {
        cliente: resultado.diseño.cliente,
        nombreDiseño: resultado.diseño.nombreDiseño,
        estiloBase: resultado.diseño.estiloBase,
        tipoDegradado: resultado.diseño.tipoDegradado,
        longitudSuperior: resultado.diseño.longitudSuperior,
        textura: resultado.diseño.textura,
        diseñoLateral: resultado.diseño.diseñoLateral,
        terminacionNuca: resultado.diseño.terminacionNuca,
        estiloBarba: resultado.diseño.estiloBarba,
        observaciones: resultado.diseño.observaciones,
      };
      idEdicion = resultado.diseño.id;
      mensaje = resultado.diseño.estado === 'Personalizado'
        ? 'Diseño personalizado guardado correctamente.'
        : 'Borrador guardado correctamente. Puedes continuar editándolo.';
    }
  }

  async function guardarEnSupabase(): Promise<void> {
    if (procesandoGuardadoSupabase) return;

    intentoGuardar = true;
    intentoFinalizar = false;
    intentoGuardarSupabase = true;
    esError = true;
    mensaje = '';
    procesandoGuardadoSupabase = true;

    try {
      const resultado = await onGuardarSupabase({ ...formulario });
      if (resultado.error || !resultado.diseno) {
        mensaje = resultado.error ?? 'No se pudo guardar el diseño en Supabase.';
        return;
      }

      esError = false;
      intentoGuardar = false;
      intentoGuardarSupabase = false;
      limpiarBorradorSesion();
      mensaje = 'Diseño guardado en Supabase correctamente.';
    } catch (error) {
      mensaje = error instanceof Error
        ? `No se pudo guardar el diseño en Supabase: ${error.message}`
        : 'No se pudo guardar el diseño en Supabase. Revisa tu conexión e inténtalo nuevamente.';
    } finally {
      procesandoGuardadoSupabase = false;
    }
  }
</script>

<section id="formulario" class="tarjeta formulario-diseno" aria-labelledby="titulo-formulario-diseno">
  <p class="etiqueta">PERSONALIZA TU CORTE</p>
  <h2 id="titulo-formulario-diseno">
    {idEdicion ? 'Editar diseño' : 'Crear un diseño'}
  </h2>

  <form onsubmit={enviarFormulario} novalidate>
    <div class="campo-formulario">
      <label for="nombre-cliente">Nombre del cliente</label>
      <input
        id="nombre-cliente"
        name="cliente"
        type="text"
        autocomplete="name"
        bind:value={formulario.cliente}
        aria-invalid={campoInvalido(formulario.cliente)}
        aria-describedby={campoInvalido(formulario.cliente) ? 'error-nombre-cliente' : undefined}
      />
      {#if campoInvalido(formulario.cliente)}
        <p id="error-nombre-cliente" class="mensaje-error">Escribe el nombre del cliente.</p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="nombre-diseno">Nombre del diseño</label>
      <input
        id="nombre-diseno"
        name="nombreDiseño"
        type="text"
        bind:value={formulario.nombreDiseño}
        aria-invalid={campoInvalido(formulario.nombreDiseño)}
        aria-describedby={campoInvalido(formulario.nombreDiseño) ? 'error-nombre-diseno' : undefined}
      />
      {#if campoInvalido(formulario.nombreDiseño)}
        <p id="error-nombre-diseno" class="mensaje-error">Escribe un nombre para el diseño.</p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="estilo-base">Estilo base</label>
      <select
        id="estilo-base"
        name="estiloBase"
        bind:value={formulario.estiloBase}
        disabled={cargandoEstilos || Boolean(errorEstilos) || estilosBaseDisponibles.length === 0}
        aria-invalid={caracteristicaInvalida(formulario.estiloBase) || estiloBaseSupabaseInvalido()}
        aria-describedby={caracteristicaInvalida(formulario.estiloBase) || estiloBaseSupabaseInvalido() ? 'error-estilo-base' : undefined}
      >
        <option value="">
          {cargandoEstilos
            ? 'Cargando estilos...'
            : errorEstilos
              ? 'No se pudieron cargar los estilos'
              : estilosBaseDisponibles.length === 0
                ? 'No hay estilos disponibles'
                : 'Selecciona un estilo base'}
        </option>
        {#each estilosBaseDisponibles as estilo (estilo.id_estilo)}
          <option value={estilo.nombre}>{estilo.nombre}</option>
        {/each}
      </select>
      {#if errorEstilos}
        <p class="mensaje-error" role="alert">{errorEstilos}</p>
      {:else if !cargandoEstilos && estilosBaseDisponibles.length === 0}
        <p role="status">No hay estilos base disponibles.</p>
      {/if}
      {#if caracteristicaInvalida(formulario.estiloBase)}
        <p id="error-estilo-base" class="mensaje-error">Selecciona un estilo base.</p>
      {:else if estiloBaseSupabaseInvalido()}
        <p id="error-estilo-base" class="mensaje-error">
          El estilo seleccionado no está disponible. Selecciónalo de nuevo o déjalo vacío.
        </p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="tipo-degradado">Tipo de degradado</label>
      <select
        id="tipo-degradado"
        name="tipoDegradado"
        bind:value={formulario.tipoDegradado}
        aria-invalid={caracteristicaInvalida(formulario.tipoDegradado)}
        aria-describedby={caracteristicaInvalida(formulario.tipoDegradado) ? 'error-tipo-degradado' : undefined}
      >
        <option value="">Selecciona un tipo de degradado</option>
        {#each tiposDegradado as opcion}
          <option value={opcion}>{opcion}</option>
        {/each}
      </select>
      {#if caracteristicaInvalida(formulario.tipoDegradado)}
        <p id="error-tipo-degradado" class="mensaje-error">Selecciona un tipo de degradado.</p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="longitud-superior">Longitud superior</label>
      <select
        id="longitud-superior"
        name="longitudSuperior"
        bind:value={formulario.longitudSuperior}
        aria-invalid={caracteristicaInvalida(formulario.longitudSuperior)}
        aria-describedby={caracteristicaInvalida(formulario.longitudSuperior) ? 'error-longitud-superior' : undefined}
      >
        <option value="">Selecciona una longitud</option>
        {#each longitudesSuperiores as opcion}
          <option value={opcion}>{opcion}</option>
        {/each}
      </select>
      {#if caracteristicaInvalida(formulario.longitudSuperior)}
        <p id="error-longitud-superior" class="mensaje-error">Selecciona la longitud superior.</p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="textura-cabello">Textura del cabello</label>
      <select
        id="textura-cabello"
        name="textura"
        bind:value={formulario.textura}
        aria-invalid={caracteristicaInvalida(formulario.textura)}
        aria-describedby={caracteristicaInvalida(formulario.textura) ? 'error-textura-cabello' : undefined}
      >
        <option value="">Selecciona una textura</option>
        {#each texturas as opcion}
          <option value={opcion}>{opcion}</option>
        {/each}
      </select>
      {#if caracteristicaInvalida(formulario.textura)}
        <p id="error-textura-cabello" class="mensaje-error">Selecciona una textura.</p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="diseno-lateral">Diseño lateral</label>
      <select
        id="diseno-lateral"
        name="diseñoLateral"
        bind:value={formulario.diseñoLateral}
        aria-invalid={caracteristicaInvalida(formulario.diseñoLateral)}
        aria-describedby={caracteristicaInvalida(formulario.diseñoLateral) ? 'error-diseno-lateral' : undefined}
      >
        <option value="">Selecciona un diseño lateral</option>
        {#each diseñosLaterales as opcion}
          <option value={opcion}>{opcion}</option>
        {/each}
      </select>
      {#if caracteristicaInvalida(formulario.diseñoLateral)}
        <p id="error-diseno-lateral" class="mensaje-error">Selecciona un diseño lateral.</p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="terminacion-nuca">Terminación de nuca</label>
      <select
        id="terminacion-nuca"
        name="terminacionNuca"
        bind:value={formulario.terminacionNuca}
        aria-invalid={caracteristicaInvalida(formulario.terminacionNuca)}
        aria-describedby={caracteristicaInvalida(formulario.terminacionNuca) ? 'error-terminacion-nuca' : undefined}
      >
        <option value="">Selecciona una terminación</option>
        {#each terminacionesNuca as opcion}
          <option value={opcion}>{opcion}</option>
        {/each}
      </select>
      {#if caracteristicaInvalida(formulario.terminacionNuca)}
        <p id="error-terminacion-nuca" class="mensaje-error">Selecciona la terminación de nuca.</p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="estilo-barba">Estilo de barba</label>
      <select
        id="estilo-barba"
        name="estiloBarba"
        bind:value={formulario.estiloBarba}
        aria-invalid={caracteristicaInvalida(formulario.estiloBarba)}
        aria-describedby={caracteristicaInvalida(formulario.estiloBarba) ? 'error-estilo-barba' : undefined}
      >
        <option value="">Selecciona un estilo de barba</option>
        {#each estilosBarba as opcion}
          <option value={opcion}>{opcion}</option>
        {/each}
      </select>
      {#if caracteristicaInvalida(formulario.estiloBarba)}
        <p id="error-estilo-barba" class="mensaje-error">Selecciona un estilo de barba.</p>
      {/if}
    </div>

    <div class="campo-formulario">
      <label for="observaciones-diseno">Observaciones (opcional)</label>
      <textarea
        id="observaciones-diseno"
        name="observaciones"
        rows="3"
        bind:value={formulario.observaciones}
      ></textarea>
    </div>

    {#if errorBorrador}
      <p class="mensaje-error" role="alert">{errorBorrador}</p>
    {/if}
    {#if mensaje}
      <p class={esError ? 'mensaje-error' : ''} role={esError ? 'alert' : 'status'}>{mensaje}</p>
    {/if}

    <button type="submit" name="accion" value="guardar">Guardar diseño</button>
    <button type="submit" name="accion" value="finalizar">Finalizar diseño</button>
    <button
      type="submit"
      name="accion"
      value="guardar-supabase"
      disabled={procesandoGuardadoSupabase}
    >
      {procesandoGuardadoSupabase ? 'Guardando en Supabase...' : 'Guardar en Supabase'}
    </button>
  </form>
</section>
