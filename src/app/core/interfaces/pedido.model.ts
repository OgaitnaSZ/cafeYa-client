export interface ProductoPedido {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Pedido {
  pedido_id?: string; 
  numero_pedido?: string;
  cliente_id: string;
  cliente_nombre: string;
  mesa_id: string;
  productos: ProductoPedido[];
  nota: string; // Requerido (puede ser string vacío)
  pedido_padre_id?: string; // Opcional
}

export interface CreatePagoDTO {
  pedido_id: string;
  medio_pago: 'efectivo' | 'app' | 'tarjeta';
}

export interface PedidoResponse {
  pedido: Pedido;
  productos: ProductoPedido[];
}

export interface PagoResponse {
  pago_id: string;
  pedido_id: string;
  medio_de_pago: string;
  monto: number;
  IVA: number;
  monto_final: number;
  created_at: Date;
}