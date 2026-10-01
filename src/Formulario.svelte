<section class="tarjeta formulario-cita" aria-labelledby="titulo-formulario-cita">
  <p class="etiqueta">NUEVA CITA</p>
  <h2 id="titulo-formulario-cita">Solicitar una cita</h2>

  <form action="#" method="post">
    <div class="campo-formulario">
      <label for="nombre-cliente">Nombre del cliente</label>
      <input id="nombre-cliente" name="nombre" type="text" required aria-invalid="true" aria-describedby="error-nombre-cliente" />
      <p id="error-nombre-cliente" class="mensaje-error">
        Error: escribe el nombre del cliente.
      </p>
    </div>

    <div class="campo-formulario">
      <label for="servicio-cita">Servicio</label>
      <select id="servicio-cita" name="servicio" required aria-invalid="true" aria-describedby="error-servicio-cita">
        <option value="">Selecciona un servicio</option>
        <option value="corte">Corte</option>
        <option value="barba">Arreglo de barba</option>
        <option value="corte-barba">Corte y barba</option>
      </select>
      <p id="error-servicio-cita" class="mensaje-error">
        Error: selecciona un servicio.
      </p>
    </div>

    <div class="campo-formulario">
      <label for="fecha-cita">Fecha de la cita</label>
      <input id="fecha-cita" name="fecha" type="date" required aria-invalid="true" aria-describedby="error-fecha-cita" />
      <p id="error-fecha-cita" class="mensaje-error">
        Error: selecciona la fecha de la cita.
      </p>
    </div>

    <div class="campo-formulario">
      <label for="hora-cita">Hora de la cita</label>
      <input id="hora-cita" name="hora" type="time" required aria-invalid="true" aria-describedby="error-hora-cita" />
      <p id="error-hora-cita" class="mensaje-error">
        Error: selecciona la hora de la cita.
      </p>
    </div>

    <div class="campo-formulario">
      <label for="observaciones-cita">Observaciones</label>
      <textarea id="observaciones-cita" name="observaciones" rows="3"></textarea>
    </div>

    <button type="submit">Solicitar cita</button>
  </form>
</section>
