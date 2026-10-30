import type { Cliente, DisenoCorte, EstiloBase } from '../tipos';
import { supabase } from './supabase';

export interface DisenoConEstilo extends DisenoCorte {
  estilos_base: Pick<EstiloBase, 'id_estilo' | 'nombre' | 'descripcion'> | null;
}

export type NuevoDisenoCorte = Pick<
  DisenoCorte,
  | 'id_cliente'
  | 'id_estilo'
  | 'nombre_diseno'
  | 'tipo_degradado'
  | 'longitud_superior'
  | 'textura'
  | 'diseno_lateral'
  | 'terminacion_nuca'
  | 'estilo_barba'
  | 'observaciones'
  | 'estado_diseno'
>;

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

export async function obtenerIdClientePorUsuario(
  userId: string,
): Promise<Cliente['id_cliente'] | null> {
  const { data, error } = await supabase
    .from('clientes')
    .select('id_cliente')
    .eq('usuario_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id_cliente ?? null;
}

export async function crearDisenoCorte(
  diseno: NuevoDisenoCorte,
): Promise<DisenoCorte> {
  const { data, error } = await supabase
    .from('disenos_corte')
    .insert(diseno)
    .select('*')
    .returns<DisenoCorte[]>()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerDisenosAutorizados(): Promise<DisenoCorte[]> {
  const { data, error } = await supabase
    .from('disenos_corte')
    .select('*')
    .order('creado_en', { ascending: false })
    .returns<DisenoCorte[]>();

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerDisenoConEstiloPorId(
  idDiseno: string,
): Promise<DisenoConEstilo | null> {
  const { data, error } = await supabase
    .from('disenos_corte')
    .select('id_diseno, id_cliente, id_estilo, nombre_diseno, tipo_degradado, longitud_superior, textura, diseno_lateral, terminacion_nuca, estilo_barba, observaciones, estado_diseno, creado_en, actualizado_en, estilos_base(id_estilo, nombre, descripcion)')
    .eq('id_diseno', idDiseno)
    .returns<DisenoConEstilo[]>();

  if (error) {
    throw error;
  }

  return data[0] ?? null;
}
