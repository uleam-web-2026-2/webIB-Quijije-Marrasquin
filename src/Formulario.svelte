<script lang="ts">
  import {
    diseñoVacio,
    diseñosLaterales,
    estilosBarba,
    estilosBase,
    estaCompleto,
    longitudesSuperiores,
    terminacionesNuca,
    texturas,
    tiposDegradado,
    type CaracteristicasDiseño,
    type DiseñoCorte,
  } from './lib/diseños';

  interface ResultadoGuardado {
    diseño?: DiseñoCorte;
    error?: string;
  }

  let {
    diseñoSeleccionado,
    versionFormulario,
    onGuardar,
  }: {
    diseñoSeleccionado: DiseñoCorte | null;
    versionFormulario: number;
    onGuardar: (
      diseño: CaracteristicasDiseño,
      id: string | null,
      finalizar: boolean,
    ) => ResultadoGuardado;
  } = $props();

  let formulario = $state<CaracteristicasDiseño>(diseñoVacio());
  let idEdicion = $state<string | null>(null);
  let mensaje = $state('');
  let esError = $state(false);
  let intentoGuardar = $state(false);
  let intentoFinalizar = $state(false);
  let ultimaVersionFormulario = 0;

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
      ultimaVersionFormulario = versionFormulario;
    } else if (versionFormulario !== ultimaVersionFormulario) {
      formulario = diseñoVacio();
      idEdicion = null;
      mensaje = '';
      esError = false;
      intentoGuardar = false;
      intentoFinalizar = false;
      ultimaVersionFormulario = versionFormulario;
    }
  });

  function campoInvalido(valor: string): boolean {
    return intentoGuardar && !valor.trim();
  }

  function caracteristicaInvalida(valor: string): boolean {
    return intentoFinalizar && !valor.trim();
  }

  function enviarFormulario(evento: SubmitEvent): void {
    evento.preventDefault();
    intentoGuardar = true;
    esError = true;
    const accion = evento.submitter instanceof HTMLButtonElement
      ? evento.submitter.value
      : 'guardar';
    const finalizar = accion === 'finalizar';
    intentoFinalizar = finalizar;

    if (!formulario.cliente.trim() || !formulario.nombreDiseño.trim()) {
      mensaje = 'Escribe el nombre del cliente y el nombre del diseño para guardarlo.';
      return;
    }

    if (finalizar && !estaCompleto(formulario)) {
      mensaje = 'Completa todas las características obligatorias antes de finalizar el diseño.';
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
      formulario = diseñoVacio();
      idEdicion = null;
      mensaje = 'Diseño finalizado correctamente. Ya está preparado para enviarse.';
    } else {
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
        aria-invalid={caracteristicaInvalida(formulario.estiloBase)}
        aria-describedby={caracteristicaInvalida(formulario.estiloBase) ? 'error-estilo-base' : undefined}
      >
        <option value="">Selecciona un estilo base</option>
        {#each estilosBase as estilo}
          <option value={estilo}>{estilo}</option>
        {/each}
      </select>
      {#if caracteristicaInvalida(formulario.estiloBase)}
        <p id="error-estilo-base" class="mensaje-error">Selecciona un estilo base.</p>
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

    {#if mensaje}
      <p class={esError ? 'mensaje-error' : ''} role={esError ? 'alert' : 'status'}>{mensaje}</p>
    {/if}

    <button type="submit" name="accion" value="guardar">Guardar diseño</button>
    <button type="submit" name="accion" value="finalizar">Finalizar diseño</button>
  </form>
</section>
