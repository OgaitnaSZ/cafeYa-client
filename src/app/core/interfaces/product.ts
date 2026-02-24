export interface Product {
  producto_id: string;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  imagen_url?: string;
  categoria_id: number;
  categoria?: Categoria;
  stock: Number;
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