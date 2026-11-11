export const URL_BASE: string = import.meta.env.VITE_SUPABASE_URL;
export const CLAVE_PUBLICA: string = import.meta.env.VITE_SUPABASE_CLAVE;

const CLAVE_SESION = "mesa.sesion";

export interface SesionGuardada {
  token: string;
  correo: string;
}

export function leerSesion(): SesionGuardada | null {
  const guardado = localStorage.getItem(CLAVE_SESION);
  if (guardado === null) return null;
  try {
    const dato = JSON.parse(guardado);
    if (typeof dato.token === "string" && typeof dato.correo === "string") {
      return dato;
    }
  } catch (error) {
    console.error(error);
    localStorage.removeItem(CLAVE_SESION);
    return null;
  }
  return null;
}

export function guardarSesion(sesion: SesionGuardada | null): void {
  if (sesion === null) {
    localStorage.removeItem(CLAVE_SESION);
  } else {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }
}

export function cabeceras(): Record<string, string> {
  const lista: Record<string, string> = {
    apikey: CLAVE_PUBLICA,
    "Content-Type": "application/json",
  };
  const sesion = leerSesion();
  if (sesion !== null) {
    lista["Authorization"] = "Bearer " + sesion.token;
  }
  return lista;
}