export interface Product {
  producto_id: string;
  nombre: string;
  precio_unitario: number;
  descripcion: string;
  emoji?: string;
  imagen_url?: string;
  disponibilidad: boolean;
  categoria_id: number;
  categoria?: Categoria;
}

export interface Categoria {
  categoria_id: number;
  nombre: string;
  emoji: string;
}

export interface CartItem{
  producto: Product;
  cantidad: number;
  notas?: string;
}