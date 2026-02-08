export interface Product {
  producto_id: string;
  nombre: string;
  precio_unitario: number;
  descripcion: string;
  emoji?: string;
  imagen?: string;
  disponibilidad: boolean;
  categoria_id: number;
  categoria?: Categoria;
}

export interface Categoria {
  categoria_id: number;
  nombre: string;
  emoji: string;
}