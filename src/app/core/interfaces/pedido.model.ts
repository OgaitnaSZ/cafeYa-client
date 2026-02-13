import { CartItem } from "./product";
export interface Pedido {
  pedido_id?: string; 
  numero_pedido?: string;
  cliente_id: string;
  cliente_nombre: string;
  estado?: 'Pendiente' | 'En preparacion' | 'Entregado';
  mesa_id: string;
  productos: CartItem[];
  precio_total?: number;
  nota: string; // Requerido (puede ser string vacío)
  pedido_padre_id?: string; // Opcional
}

export interface PedidoResponse {
  pedido: Pedido;
  productos: CartItem[];
}

export interface CreatePagoDTO {
  pedido_id: string;
  medio_pago: 'efectivo' | 'app' | 'tarjeta';
}

export interface PagoResponse {
  pago_id: string;
  pedido_id: string;
  medio_de_pago: 'efectivo' | 'app' | 'tarjeta' ;
  monto: number;
  IVA: number;
  monto_final: number;
  created_at: Date;
}

export interface PedidoData {
  // Datos del pedido
  pedido_id: string; 
  numero_pedido: string;
  cliente_id: string;
  cliente_nombre: string;
  mesa_id: string;
  nota: string;
  precio_total: number;
  estado: 'Pendiente' | 'En preparacion' | 'Entregado';
  productos: CartItem[];
  pedido_padre_id?: string; // Opcional
  calificacion?: Calificacion;
  
  // Datos del pago
  pago_id: string;
  medio_pago: 'efectivo' | 'app' | 'tarjeta';
  monto: number;
  monto_final: number;
  IVA: number;
  fecha_pago: Date;
}

export interface Calificacion {
  calificacion_id?: string;
  pedido_id: string;
  puntuacion: number;
  nombre_cliente: string;
  resena: string;
};