import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type EstadoPedido = 'pendiente' | 'en_preparacion' | 'entregado';
type MetodoPago = 'efectivo' | 'tarjeta' | 'mercadopago';

interface CartItem {
  producto: {
    producto_id: string;
    nombre: string;
    precio_unitario: number;
  };
  cantidad: number;
  notas: string;
}

interface Pedido {
  id: string;
  numero: string;
  items: CartItem[];
  total: number;
  estado: EstadoPedido;
  fecha: Date;
  metodoPago: MetodoPago;
  calificado: boolean;
  calificacion?: number;
}

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
private router = inject(Router);

  // Datos de mesa
  mesaNumber = signal('5');

  // Modal
  selectedPedido = signal<Pedido | undefined>(undefined);

  // Pedidos (simulados - en producción vendrían de un servicio)
  pedidos = signal<Pedido[]>([
    {
      id: '003',
      numero: '003',
      items: [
        {
          producto: { producto_id: '1', nombre: 'Café con leche', precio_unitario: 1200 },
          cantidad: 2,
          notas: 'Sin azúcar'
        },
        {
          producto: { producto_id: '2', nombre: 'Medialunas x3', precio_unitario: 900 },
          cantidad: 1,
          notas: ''
        }
      ],
      total: 3300,
      estado: 'en_preparacion',
      fecha: new Date(Date.now() - 10 * 60000), // Hace 10 min
      metodoPago: 'mercadopago',
      calificado: false
    },
    {
      id: '002',
      numero: '002',
      items: [
        {
          producto: { producto_id: '3', nombre: 'Tostado mixto', precio_unitario: 2500 },
          cantidad: 1,
          notas: 'Bien tostado'
        }
      ],
      total: 2500,
      estado: 'entregado',
      fecha: new Date(Date.now() - 30 * 60000), // Hace 30 min
      metodoPago: 'efectivo',
      calificado: false
    },
    {
      id: '001',
      numero: '001',
      items: [
        {
          producto: { producto_id: '4', nombre: 'Jugo de naranja', precio_unitario: 1800 },
          cantidad: 2,
          notas: ''
        },
        {
          producto: { producto_id: '1', nombre: 'Café con leche', precio_unitario: 1200 },
          cantidad: 1,
          notas: 'Extra caliente'
        }
      ],
      total: 4800,
      estado: 'entregado',
      fecha: new Date(Date.now() - 60 * 60000), // Hace 1 hora
      metodoPago: 'tarjeta',
      calificado: true,
      calificacion: 5
    }
  ]);

  // COMPUTED
  pedidosActivos = computed(() =>
    this.pedidos().filter(p => p.estado !== 'entregado')
  );

  // HELPERS
  getEstadoBadgeClass(estado: EstadoPedido): string {
    const classes: Record<EstadoPedido, string> = {
      pendiente: 'bg-yellow-100 text-yellow-700',
      en_preparacion: 'bg-blue-100 text-blue-700',
      entregado: 'bg-green-100 text-green-700'
    };
    return classes[estado];
  }

  getEstadoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      pendiente: '⏳ Pendiente',
      en_preparacion: '👨‍🍳 Preparando',
      entregado: '✓ Entregado'
    };
    return labels[estado];
  }

  getProgresoWidth(estado: EstadoPedido): string {
    const widths: Record<EstadoPedido, string> = {
      pendiente: '33%',
      en_preparacion: '66%',
      entregado: '100%'
    };
    return widths[estado];
  }

  getMetodoPagoLabel(metodo: MetodoPago): string {
    const labels: Record<MetodoPago, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      mercadopago: 'Mercado Pago'
    };
    return labels[metodo];
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // MODAL
  openPedidoDetail(pedido: Pedido): void {
    this.selectedPedido.set(pedido);
    document.body.style.overflow = 'hidden';
  }

  closePedidoDetail(): void {
    this.selectedPedido.set(undefined);
    document.body.style.overflow = 'unset';
  }

  // NAVEGACIÓN
  goToMenu(): void {
    this.router.navigate(['/menu']);
  }

  goToRating(pedido: Pedido, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/rating', pedido.id]);
  }

  goToRatingFromModal(): void {
    const pedido = this.selectedPedido();
    if (pedido) {
      this.closePedidoDetail();
      this.router.navigate(['/rating', pedido.id]);
    }
  }
}
