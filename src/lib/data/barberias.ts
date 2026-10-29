export interface Barberia {
  idBarberia: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
}

export const barberiasRegistradas: Barberia[] = [
  {
    idBarberia: 'barberia-el-patron',
    nombre: 'Barbería El Patrón',
    ubicacion: 'Manta',
    descripcion: 'Especialistas en cortes modernos y degradados.',
  },
  {
    idBarberia: 'king-barber',
    nombre: 'King Barber',
    ubicacion: 'Montecristi',
    descripcion: 'Barbería especializada en estilos urbanos.',
  },
  {
    idBarberia: 'estilo-urbano',
    nombre: 'Estilo Urbano',
    ubicacion: 'Portoviejo',
    descripcion: 'Cortes clásicos y personalizados.',
  },
];
