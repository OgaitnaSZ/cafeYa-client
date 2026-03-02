import { CartItem } from "./product";

export enum PedidoEstado {
  Pendiente = 'Pendiente',
  EnPreparacion = 'En_preparacion',
  Listo = 'Listo',
  Entregado = 'Entregado'
}

export enum MedioPago {
  Efectivo = 'efectivo',
  App = 'app',
  Tarjeta = 'tarjeta'
}
export interface Pedido {
  pedido_id?: string; 
  numero_pedido?: string;
  cliente_id: string;
  cliente_nombre: string;
  estado?: PedidoEstado;
  mesa_id: string;
  productos: CartItem[];
  precio_total?: number;
  nota: string;
  pedido_padre_id?: string; // Opcional
}

export interface PedidoResponse {
  pedido: Pedido;
  productos: CartItem[];
}

export interface CreatePagoDTO {
  pedido_id: string;
  medio_pago: MedioPago;
}

export interface PagoResponse {
  pago_id: string;
  pedido_id: string;
  medio_de_pago: MedioPago ;
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
  estado: PedidoEstado;
  productos: CartItem[];
  pedido_padre_id?: string; // Opcional
  calificacion?: Calificacion;
  
  // Datos del pago
  pago_id: string;
  medio_pago: MedioPago;
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