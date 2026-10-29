export const estilosBase = [
  'Taper Fade',
  'Low Fade',
  'Mid Fade',
  'High Fade',
  'Mullet',
  'Buzz Cut',
  'French Crop',
  'Corte clásico',
] as const;

export const tiposDegradado = ['Sin degradado', 'Bajo', 'Medio', 'Alto', 'Taper'] as const;
export const longitudesSuperiores = ['Muy corto', 'Corto', 'Medio', 'Largo'] as const;
export const texturas = ['Lisa', 'Ondulada', 'Rizada', 'Afro'] as const;
export const diseñosLaterales = ['Sin diseño', 'Una línea', 'Dos líneas', 'Diseño personalizado'] as const;
export const terminacionesNuca = ['Natural', 'Cuadrada', 'Redondeada', 'En V'] as const;
export const estilosBarba = ['Sin barba', 'Barba corta', 'Barba completa', 'Barba degradada'] as const;

export type EstadoDiseño = 'Borrador' | 'Personalizado' | 'Finalizado';

export interface CaracteristicasDiseño {
  cliente: string;
  nombreDiseño: string;
  estiloBase: string;
  tipoDegradado: string;
  longitudSuperior: string;
  textura: string;
  diseñoLateral: string;
  terminacionNuca: string;
  estiloBarba: string;
  observaciones: string;
}

export interface DiseñoCorte extends CaracteristicasDiseño {
  id: string;
  estado: EstadoDiseño;
  creadoEn: string;
  actualizadoEn: string;
}

export const diseñoVacio = (): CaracteristicasDiseño => ({
  cliente: '',
  nombreDiseño: '',
  estiloBase: '',
  tipoDegradado: '',
  longitudSuperior: '',
  textura: '',
  diseñoLateral: '',
  terminacionNuca: '',
  estiloBarba: '',
  observaciones: '',
});

export function estaCompleto(diseño: CaracteristicasDiseño): boolean {
  return [
    diseño.cliente,
    diseño.nombreDiseño,
    diseño.estiloBase,
    diseño.tipoDegradado,
    diseño.longitudSuperior,
    diseño.textura,
    diseño.diseñoLateral,
    diseño.terminacionNuca,
    diseño.estiloBarba,
  ].every((valor) => valor.trim().length > 0);
}

const claveAlmacenamiento = 'corte-ideal-diseños-v1';

function esDiseñoCorte(valor: unknown): valor is DiseñoCorte {
  if (typeof valor !== 'object' || valor === null) return false;
  const diseño = valor as Record<string, unknown>;
  return (
    typeof diseño.id === 'string' &&
    typeof diseño.cliente === 'string' &&
    typeof diseño.nombreDiseño === 'string' &&
    typeof diseño.estiloBase === 'string' &&
    typeof diseño.tipoDegradado === 'string' &&
    typeof diseño.longitudSuperior === 'string' &&
    typeof diseño.textura === 'string' &&
    typeof diseño.diseñoLateral === 'string' &&
    typeof diseño.terminacionNuca === 'string' &&
    typeof diseño.estiloBarba === 'string' &&
    typeof diseño.observaciones === 'string' &&
    (diseño.estado === 'Borrador' ||
      diseño.estado === 'Personalizado' ||
      diseño.estado === 'Finalizado') &&
    typeof diseño.creadoEn === 'string' &&
    typeof diseño.actualizadoEn === 'string'
  );
}

export function cargarDiseños(): DiseñoCorte[] {
  const guardado = localStorage.getItem(claveAlmacenamiento);
  if (guardado === null) return [];

  const datos: unknown = JSON.parse(guardado);
  if (!Array.isArray(datos) || !datos.every(esDiseñoCorte)) {
    throw new Error('Los diseños guardados tienen un formato no válido.');
  }
  return datos;
}

export function guardarDiseños(diseños: DiseñoCorte[]): void {
  localStorage.setItem(claveAlmacenamiento, JSON.stringify(diseños));
}
