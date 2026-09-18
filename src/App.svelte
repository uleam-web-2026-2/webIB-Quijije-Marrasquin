<div class="lamina">
  <header class="cabecera">
    <div class="marca">
      <p class="marca-nombre"><strong>Corte Ideal</strong></p>
      <p class="marca-local">Diseña tu corte · Reserva cuando estés listo</p>
    </div>

    <nav class="menu" aria-label="Navegación principal">
      <ul>
        <li><a href="#citas" aria-current="page">Citas</a></li>
        <li><a href="#clientes">Clientes</a></li>
      </ul>
    </nav>

    <a class="accion-principal" href="#citas">Ver citas</a>
  </header>

  <main class="contenido">
    <section class="portada" aria-labelledby="titulo-principal">
      <p class="etiqueta">AGENDA DEL BARBERO</p>
      <h1 id="titulo-principal">¿Qué citas tengo hoy y en qué estado está cada una?</h1>
      <p class="portada-texto">
        Consulta las citas del día y revisa rápidamente el cliente, el servicio
        solicitado, el estado y la acción disponible para cada atención.
      </p>
    </section>

    <section id="citas" class="tarjeta" aria-labelledby="titulo-citas">
      <div class="cabecera-seccion">
        <div>
          <p class="etiqueta">ENTIDAD: CITA</p>
          <h2 id="titulo-citas">Citas de hoy</h2>
        </div>
        <span class="estado-diseño">4 citas</span>
      </div>

      <div class="tabla-scroll">
        <table>
          <caption>Listado de citas programadas para hoy</caption>
          <thead>
            <tr>
              <th scope="col">Hora</th>
              <th scope="col">Cliente</th>
              <th scope="col">Servicio</th>
              <th scope="col">Estado</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Hora">09:00</td>
              <td data-label="Cliente">Alex</td>
              <td data-label="Servicio">Fade medio personalizado</td>
              <td data-label="Estado"><span class="estado estado-solicitada">Solicitada</span></td>
              <td data-label="Acción"><a href="#citas">Revisar</a></td>
            </tr>
            <tr>
              <td data-label="Hora">10:30</td>
              <td data-label="Cliente">Sam</td>
              <td data-label="Servicio">Taper con patillas marcadas</td>
              <td data-label="Estado"><span class="estado estado-aceptada">Aceptada</span></td>
              <td data-label="Acción"><a href="#citas">Ver detalle</a></td>
            </tr>
            <tr>
              <td data-label="Hora">12:00</td>
              <td data-label="Cliente">Dani</td>
              <td data-label="Servicio">Mullet personalizado</td>
              <td data-label="Estado"><span class="estado estado-proceso">En proceso</span></td>
              <td data-label="Acción"><a href="#citas">Continuar</a></td>
            </tr>
            <tr>
              <td data-label="Hora">15:30</td>
              <td data-label="Cliente">Leo</td>
              <td data-label="Servicio">Buzz con diseño lateral</td>
              <td data-label="Estado"><span class="estado estado-completada">Completada</span></td>
              <td data-label="Acción"><a href="#citas">Consultar</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="clientes" class="tarjeta" aria-labelledby="titulo-clientes">
      <p class="etiqueta">ENTIDAD RELACIONADA: CLIENTE</p>
      <h2 id="titulo-clientes">Clientes</h2>
      <p>
        Cada cita está asociada a un cliente. En esta primera pantalla se muestra
        su nombre como información necesaria para que el barbero identifique la atención.
      </p>
    </section>
  </main>

  <footer class="pie">
    <p>Corte Ideal · Proyecto docente ULEAM 2026-2 · Quijije &amp; Marrasquín</p>
    <p>Diseña tu estilo antes de tu próxima cita.</p>
  </footer>
</div>
