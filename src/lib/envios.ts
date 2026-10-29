import type { CaracteristicasDiseño } from './diseños';

export type EstadoEnvio = 'Recibido' | 'Aceptado' | 'Rechazado';

export interface EnvioDiseño {
  idEnvio: string;
  idDiseño: string;
  idBarberia: string;
  fechaEnvio: string;
  estadoEnvio: EstadoEnvio;
  respuesta: string;
  copiaDiseño: CaracteristicasDiseño;
}

const claveAlmacenamiento = 'corte-ideal-envios-v1';

function esCaracteristicasDiseño(valor: unknown): valor is CaracteristicasDiseño {
  if (typeof valor !== 'object' || valor === null) return false;
  const diseño = valor as Record<string, unknown>;
  return [
    'cliente',
    'nombreDiseño',
    'estiloBase',
    'tipoDegradado',
    'longitudSuperior',
    'textura',
    'diseñoLateral',
    'terminacionNuca',
    'estiloBarba',
    'observaciones',
  ].every((campo) => typeof diseño[campo] === 'string');
}

function esEnvioDiseño(valor: unknown): valor is EnvioDiseño {
  if (typeof valor !== 'object' || valor === null) return false;
  const envio = valor as Record<string, unknown>;
  return (
    typeof envio.idEnvio === 'string' &&
    typeof envio.idDiseño === 'string' &&
    typeof envio.idBarberia === 'string' &&
    typeof envio.fechaEnvio === 'string' &&
    (envio.estadoEnvio === 'Recibido' ||
      envio.estadoEnvio === 'Aceptado' ||
      envio.estadoEnvio === 'Rechazado') &&
    typeof envio.respuesta === 'string' &&
    esCaracteristicasDiseño(envio.copiaDiseño)
  );
}

export function cargarEnvios(): EnvioDiseño[] {
  const guardado = localStorage.getItem(claveAlmacenamiento);
  if (guardado === null) return [];

  const datos: unknown = JSON.parse(guardado);
  if (!Array.isArray(datos) || !datos.every(esEnvioDiseño)) {
    throw new Error('Los envíos guardados tienen un formato no válido.');
  }
  return datos;
}

export function guardarEnvios(envios: EnvioDiseño[]): void {
  localStorage.setItem(claveAlmacenamiento, JSON.stringify(envios));
}
