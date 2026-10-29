import type { DisenoCorte, EstiloBase } from '../tipos';
import { supabase } from './supabase';

export interface DisenoConEstilo extends DisenoCorte {
  estilos_base: Pick<EstiloBase, 'id_estilo' | 'nombre' | 'descripcion'> | null;
}

export async function obtenerEstilosBase(): Promise<EstiloBase[]> {
  const { data, error } = await supabase
    .from('estilos_base')
    .select('*')
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerUnDisenoConEstilo(): Promise<DisenoConEstilo | null> {
  const { data, error } = await supabase
    .from('disenos_corte')
    .select('id_diseno, id_cliente, id_estilo, nombre_diseno, tipo_degradado, longitud_superior, textura, diseno_lateral, terminacion_nuca, estilo_barba, observaciones, estado_diseno, creado_en, actualizado_en, estilos_base(id_estilo, nombre, descripcion)')
    .order('creado_en', { ascending: false })
    .limit(1)
    .returns<DisenoConEstilo[]>();

  if (error) {
    throw error;
  }

  return data[0] ?? null;
}
