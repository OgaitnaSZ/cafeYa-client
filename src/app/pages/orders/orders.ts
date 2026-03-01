import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PedidoData } from '../../core/interfaces/pedido.model';
import { Auth } from '../../core/services/auth';
import { MesaService } from '../../core/services/mesa';
import { PedidoService } from '../../core/services/pedido';
import { Rating } from '../../layout/components/rating/rating';
import { CalificacionService } from '../../core/services/calificacion';
import { 
  ChevronRight,
  Clipboard,
  Clock,
  Check,
  ChefHat,
  LucideAngularModule,
  Star,
  Hourglass,
  PackageCheck, 
} from 'lucide-angular';
import { OrderDetails } from './order-details/order-details';
import { BadgeConfig, Header } from '../../layout/components/header/header';

type EstadoPedido = 'Pendiente' | 'En_preparacion' | 'Listo' | 'Entregado';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, Rating, LucideAngularModule, OrderDetails, Header],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  // Servicios
  private router = inject(Router);
  public auth = inject(Auth);
  public mesaService = inject(MesaService);
  public pedidosService = inject(PedidoService);
  public calificacionService = inject(CalificacionService);

  // Signals
  user = this.auth.user;
  mesa = this.auth.getMesa;
  error = this.auth.errorMesa;
  loading = this.auth.loadingMesa;
  mesaDetails = this.mesaService.mesa;
  
  // Datos de mesa
  pedidos = this.pedidosService.pedidosMesa;
  
  // Modals
  selectedPedido = signal<PedidoData | undefined>(undefined);
  showRatingModal = signal(false);
  pedidoToRate = signal<PedidoData | undefined>(undefined);

  // Badge para header
  badgeConfig = computed<BadgeConfig>(() => {
    const pendientes = this.pedidosService.totalPedidosPendientes();
    
    if (pendientes > 0) {
      return {
        text: `${pendientes} en curso`,
        color: 'orange',
        pulse: true
      };
    }
    
    return {
      text: 'Todo al día',
      color: 'green',
      pulse: false
    };
  });

  // HELPERS DE VISTA
  getEstadoIcon(estado: EstadoPedido) {
    const icons: Record<EstadoPedido, any> = {
      "Pendiente": this.Hourglass,
      "En_preparacion": this.ChefHat,
      "Listo": this.PackageCheck,
      "Entregado": this.Check
    };
    return icons[estado];
  }
  
  getEstadoBadgeClass(estado: EstadoPedido): string {
    const classes: Record<EstadoPedido, string> = {
      "Pendiente": 'bg-yellow-100 text-yellow-700',
      "En_preparacion": 'bg-blue-100 text-blue-700',
      "Listo": 'bg-green-100 text-green-700',
      "Entregado": 'bg-orange-100 text-orange-700'
    };
    return classes[estado];
  }
  
  getEstadoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      "Pendiente": 'Pendiente',
      "En_preparacion": 'Preparando',
      "Listo": 'Listo',
      "Entregado": 'Entregado'
    };
    return labels[estado];
  }

  getProgresoWidth(estado: EstadoPedido): string {
    const widths: Record<EstadoPedido, string> = {
      "Pendiente": '5%',
      "En_preparacion": '33%',
      "Listo": '66%',
      "Entregado": '100%'
    };
    return widths[estado];
  }

  formatDate(dateInput: Date | string): string {
    const date = new Date(dateInput);
  
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

  getStarsArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  // ACCIONES DE RATING
  goToRating(pedido: PedidoData, event: Event): void {
    event.stopPropagation();
    this.pedidoToRate.set(pedido);
    this.showRatingModal.set(true);
  }

  handleRatingFromDetails(pedido: PedidoData): void {
    this.pedidoToRate.set(pedido);
    this.showRatingModal.set(true);
  }

  closeRatingModal(): void {
    this.showRatingModal.set(false);
    this.pedidoToRate.set(undefined);
  }

  handleRatingSubmitted(calificacion: any): void {
    const pedido = this.pedidoToRate();
    if (!pedido) return;
  
    this.pedidosService.agregarCalificacion(
      pedido.pedido_id, 
      calificacion
    );
  }
  
  // Icons
  readonly Clipboard = Clipboard;
  readonly ChevronRight = ChevronRight;
  readonly Star = Star;
  readonly Clock = Clock;
  readonly ChefHat = ChefHat;
  readonly Check = Check;
  readonly Hourglass = Hourglass;
  readonly PackageCheck = PackageCheck;
}