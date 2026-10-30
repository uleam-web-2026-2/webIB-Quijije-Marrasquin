-- Esquema relacional de Corte Ideal — Diseña tu propio estilo.
-- Este archivo documenta tablas, restricciones y políticas SELECT existentes;
-- no inserta datos y no debe ejecutarse como parte de esta actualización local.

-- Clientes de la aplicación. usuario_id puede ser NULL para registros de demostración.
CREATE TABLE IF NOT EXISTS public.clientes (
  id_cliente UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE REFERENCES auth.users (id),
  nombre TEXT NOT NULL
);

COMMENT ON TABLE public.clientes IS
  'Personas propietarias de diseños personalizados.';

-- Catálogo de estilos que sirven como base para personalizar un corte.
CREATE TABLE IF NOT EXISTS public.estilos_base (
  id_estilo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL
);

COMMENT ON TABLE public.estilos_base IS
  'Estilos de corte disponibles como punto de partida para los diseños.';

-- Diseños personalizados creados por clientes a partir de un estilo base.
CREATE TABLE IF NOT EXISTS public.disenos_corte (
  id_diseno UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID NOT NULL REFERENCES public.clientes (id_cliente),
  id_estilo UUID REFERENCES public.estilos_base (id_estilo),
  nombre_diseno TEXT NOT NULL,
  tipo_degradado TEXT,
  longitud_superior TEXT,
  textura TEXT,
  diseno_lateral TEXT,
  terminacion_nuca TEXT,
  estilo_barba TEXT,
  observaciones TEXT,
  estado_diseno TEXT NOT NULL DEFAULT 'Borrador'
    CHECK (estado_diseno IN ('Borrador', 'Personalizado', 'Finalizado')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT disenos_corte_finalizado_completo CHECK (
    estado_diseno <> 'Finalizado'
    OR (
      id_estilo IS NOT NULL
      AND tipo_degradado IS NOT NULL AND btrim(tipo_degradado) <> ''
      AND longitud_superior IS NOT NULL AND btrim(longitud_superior) <> ''
      AND textura IS NOT NULL AND btrim(textura) <> ''
      AND diseno_lateral IS NOT NULL AND btrim(diseno_lateral) <> ''
      AND terminacion_nuca IS NOT NULL AND btrim(terminacion_nuca) <> ''
      AND estilo_barba IS NOT NULL AND btrim(estilo_barba) <> ''
    )
  )
);

COMMENT ON TABLE public.disenos_corte IS
  'Diseños de corte personalizados pertenecientes a un cliente y basados opcionalmente en un estilo.';

-- Barberías registradas que pueden recibir diseños.
CREATE TABLE IF NOT EXISTS public.barberias (
  id_barberia UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE REFERENCES auth.users (id),
  nombre TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  descripcion TEXT NOT NULL
);

COMMENT ON TABLE public.barberias IS
  'Barberías registradas como posibles destinatarias de diseños personalizados.';

-- Envíos de diseños a barberías; copia_diseno conserva las características enviadas.
CREATE TABLE IF NOT EXISTS public.envios_diseno (
  id_envio UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_diseno UUID NOT NULL REFERENCES public.disenos_corte (id_diseno),
  id_barberia UUID NOT NULL REFERENCES public.barberias (id_barberia),
  fecha_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado_envio TEXT NOT NULL DEFAULT 'Recibido'
    CHECK (estado_envio IN ('Recibido', 'Aceptado', 'Rechazado')),
  respuesta TEXT,
  copia_diseno JSONB NOT NULL,
  CONSTRAINT envios_diseno_copia_objeto_no_vacio CHECK (
    jsonb_typeof(copia_diseno) = 'object'
    AND copia_diseno <> '{}'::jsonb
  )
);

COMMENT ON TABLE public.envios_diseno IS
  'Registro de cada envío de un diseño a una barbería, con una copia de las características enviadas. La inmutabilidad debe protegerse mediante reglas de acceso.';

-- RLS está habilitado en las cinco tablas.
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estilos_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disenos_corte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barberias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_diseno ENABLE ROW LEVEL SECURITY;

-- Políticas SELECT que, según la configuración confirmada, ya existen en Supabase.
CREATE POLICY "Lectura publica de estilos"
  ON public.estilos_base
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Lectura publica de barberias"
  ON public.barberias
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Clientes leen su propio perfil"
  ON public.clientes
  FOR SELECT
  TO authenticated
  USING (usuario_id = (SELECT auth.uid()));

CREATE POLICY "Clientes leen sus propios disenos"
  ON public.disenos_corte
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clientes AS cliente
      WHERE cliente.id_cliente = disenos_corte.id_cliente
        AND cliente.usuario_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Clientes crean sus propios disenos"
  ON public.disenos_corte
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clientes
      WHERE clientes.id_cliente = disenos_corte.id_cliente
        AND clientes.usuario_id = (SELECT auth.uid())
    )
  );
