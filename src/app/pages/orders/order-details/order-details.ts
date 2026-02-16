import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CircleCheckBig, Clock, CookingPot, LucideAngularModule, MapPin, Star} from 'lucide-angular';
import { PedidoData } from '../../../core/interfaces/pedido.model';
import { Mesa } from '../../../core/interfaces/mesa.model';
import { BottomSheet } from '../../../layout/components/bottom-sheet/bottom-sheet';


type EstadoPedido = 'Pendiente' | 'En preparacion' | 'Entregado';
type MetodoPago = 'efectivo' | 'app' | 'tarjeta';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BottomSheet],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
  // INPUTS
  selectedPedido = input.required<PedidoData>();
  mesa = input.required<Mesa>();
  isOpen = input<boolean>(true);

  // OUTPUTS
  close = output<void>();
  ratingRequested = output<PedidoData>(); // Nuevo output para pedir calificación

  // MÉTODOS DE FORMATEO
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

  ngOnInit(){
    console.log('detalles', this.selectedPedido());
  }

  getMetodoPagoLabel(metodo: MetodoPago): string {
    const labels: Record<MetodoPago, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      app: 'App'
    };
    return labels[metodo];
  }
  
  getProgresoWidth(estado: EstadoPedido): string {
    const widths: Record<EstadoPedido, string> = {
      "Pendiente": '33%',
      "En preparacion": '66%',
      "Entregado": '100%'
    };
    return widths[estado];
  }

  getEstadoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      "Pendiente": 'Pendiente',
      "En preparacion": 'Preparando',
      "Entregado": 'Entregado'
    };
    return labels[estado];
  }
  
  getEstadoBadgeClass(estado: EstadoPedido): string {
    const classes: Record<EstadoPedido, string> = {
      "Pendiente": 'bg-yellow-100 text-yellow-700',
      "En preparacion": 'bg-blue-100 text-blue-700',
      "Entregado": 'bg-green-100 text-green-700'
    };
    return classes[estado];
  }

  getStarsArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  // ACCIÓN: Solicitar calificación al padre
  requestRating(): void {
    this.close.emit(); // Primero cerramos el modal de detalles
    this.ratingRequested.emit(this.selectedPedido()); // Emitimos el pedido al padre
  }

  // Icons
  readonly Star = Star;
  readonly Clock = Clock;
  readonly CookingPot = CookingPot;
  readonly CircleCheckBig = CircleCheckBig;
  readonly MapPin = MapPin;
}