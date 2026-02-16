import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PedidoData } from '../../core/interfaces/pedido.model';
import { Auth } from '../../core/services/auth';
import { MesaService } from '../../core/services/mesa';
import { PedidoService } from '../../core/services/pedido';
import { Rating } from '../../layout/components/rating/rating';
import { CalificacionService } from '../../core/services/calificacion';
import { 
  ChevronRight,
  CircleCheckBig,
  Clipboard,
  Clock,
  Check,
  ChefHat,
  CookingPot,
  LucideAngularModule,
  MapPin,
  Star,
  X,
  Hourglass, 
 } from 'lucide-angular';
import { BottomSheet } from '../../layout/components/bottom-sheet/bottom-sheet';

type EstadoPedido = 'Pendiente' | 'En preparacion' | 'Entregado';
type MetodoPago = 'efectivo' | 'app' | 'tarjeta';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, Rating, LucideAngularModule, BottomSheet],
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

  // Modal
  isOpen = input<boolean>(true);
  selectedPedido = signal<PedidoData | undefined>(undefined);

  showRatingModal = signal(false);
  pedidoToRate = signal<PedidoData | undefined>(undefined);

  // HELPERS
  getEstadoIcon(estado: EstadoPedido) {
    const icons: Record<EstadoPedido, any> = {
      "Pendiente": this.Hourglass,
      "En preparacion": this.ChefHat,
      "Entregado": this.Check
    };
    return icons[estado];
  }
  
  getEstadoBadgeClass(estado: EstadoPedido): string {
    const classes: Record<EstadoPedido, string> = {
      "Pendiente": 'bg-yellow-100 text-yellow-700',
      "En preparacion": 'bg-blue-100 text-blue-700',
      "Entregado": 'bg-green-100 text-green-700'
    };
    return classes[estado];
  }
  
  getEstadoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      "Pendiente": 'Pendiente',
      "En preparacion": 'Preparando',
      "Entregado": 'Entregado'
    };
    return labels[estado];
  }

  getProgresoWidth(estado: EstadoPedido): string {
    const widths: Record<EstadoPedido, string> = {
      "Pendiente": '33%',
      "En preparacion": '66%',
      "Entregado": '100%'
    };
    return widths[estado];
  }

  getMetodoPagoLabel(metodo: MetodoPago): string {
    const labels: Record<MetodoPago, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      app: 'App'
    };
    return labels[metodo];
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

  goToRating(pedido: PedidoData, event: Event): void {
    event.stopPropagation();
    this.pedidoToRate.set(pedido);
    this.showRatingModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeRatingModal(): void {
    this.showRatingModal.set(false);
    this.pedidoToRate.set(undefined);
    document.body.style.overflow = 'unset';
  }

  handleRatingSubmitted(calificacion: any): void {
    const pedido = this.pedidoToRate();
    if (!pedido) return;
  
    this.pedidosService.agregarCalificacion(
      pedido.pedido_id, 
      calificacion
    );
  }

  goToRatingFromModal(): void {
    const pedido = this.selectedPedido();
    if (pedido) {
      this.selectedPedido.set(undefined);
      this.goToRating(pedido, new Event('click'));
    }
  }

  getStarsArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  // NAVEGACIÓN
  goToMenu(): void {
    this.router.navigate(['/menu']);
  }

  // Icons
  readonly Clipboard = Clipboard;
  readonly ChevronRight = ChevronRight;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly X = X;
  readonly Clock = Clock;
  readonly CookingPot = CookingPot;
  readonly CircleCheckBig = CircleCheckBig;
  readonly ChefHat = ChefHat;
  readonly Check = Check;
  readonly Hourglass = Hourglass;
}
