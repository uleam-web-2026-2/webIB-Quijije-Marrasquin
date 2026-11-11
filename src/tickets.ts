import { URL_BASE, cabeceras } from "./supabase";
import type { Ticket, EstadoTicket } from "./tipos";

export class SesionVencida extends Error {}

export interface ResultadoCambio {
  codigo: number;
  filas: Ticket[];
}

export async function cambiarEstadoTicket(
  id: number,
  nuevo: EstadoTicket,
): Promise<ResultadoCambio> {
  const respuesta = await fetch(URL_BASE + "/rest/v1/tickets?id=eq." + id, {
    method: "PATCH",
    headers: { ...cabeceras(), Prefer: "return representation" },
    body: JSON.stringify({ estado: nuevo }),
  });
  const filas: Ticket[] = respuesta.ok ? await respuesta.json() : [];
  return { codigo: respuesta.status, filas };
}

export async function cargarTickets(): Promise<Ticket[]> {
  const respuesta = await fetch(
    URL_BASE + "/rest/v1/tickets?select=*&order=creado_en.desc",
    { headers: cabeceras() }
  );

  if (respuesta.status === 401) {
    throw new SesionVencida();
  }

  if (!respuesta.ok) {
    throw new Error("Supabase respondió " + respuesta.status);
  }
  return await respuesta.json();
}