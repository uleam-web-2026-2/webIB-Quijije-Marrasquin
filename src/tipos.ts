// Estas interfaces representan filas obtenidas desde las tablas de Supabase.

export type EstadoDiseno =
  | 'Borrador'
  | 'Personalizado'
  | 'Finalizado';

export type EstadoEnvio =
  | 'Recibido'
  | 'Aceptado'
  | 'Rechazado';

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export interface Cliente {
  id_cliente: string;
  usuario_id: string | null;
  nombre: string;
}

export interface EstiloBase {
  id_estilo: string;
  nombre: string;
  descripcion: string;
}

export interface DisenoCorte {
  id_diseno: string;
  id_cliente: string;
  id_estilo: string | null;
  nombre_diseno: string;
  tipo_degradado: string | null;
  longitud_superior: string | null;
  textura: string | null;
  diseno_lateral: string | null;
  terminacion_nuca: string | null;
  estilo_barba: string | null;
  observaciones: string | null;
  estado_diseno: EstadoDiseno;
  creado_en: string;
  actualizado_en: string;
}

export interface Barberia {
  id_barberia: string;
  usuario_id: string | null;
  nombre: string;
  ubicacion: string;
  descripcion: string;
}

export interface EnvioDiseno {
  id_envio: string;
  id_diseno: string;
  id_barberia: string;
  fecha_envio: string;
  estado_envio: EstadoEnvio;
  respuesta: string | null;
  copia_diseno: Json;
}
