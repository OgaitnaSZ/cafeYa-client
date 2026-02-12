import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { MesaService } from '../../core/services/mesa';
import { PedidoService } from '../../core/services/pedido';

type EstadoPedido = 'Pendiente' | 'En preparacion' | 'Entregado';
interface PedidoResumen {
  id: string;
  items: any[];
  total: number;
  estado: EstadoPedido;
  fecha: Date;
}
@Component({
  selector: 'app-table',
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  // Servicios
  private router = inject(Router);
  public auth = inject(Auth);
  public mesaService = inject(MesaService);
  public pedidosService = inject(PedidoService);

  // Signals
  user = this.auth.user;
  mesa = this.auth.getMesa;
  pedidos = this.pedidosService.pedidosMesa;

  // Datos de la mesa (desde localStorage o sesión)
  sessionStartTime = signal('14:32');
  sessionDuration = signal('00:45');

  // Estado UI
  showCloseConfirm = signal(false);
  waiterCalled = signal(false);
  private waiterCooldownTimer: any;
  private durationTimer: any;

  ngOnDestroy(): void {
    clearInterval(this.durationTimer);
    clearTimeout(this.waiterCooldownTimer);
  }

  // BADGE HELPERS
  getEstadoBadgeClass(estado: EstadoPedido): string {
    const classes: Record<EstadoPedido, string> = {
      "Pendiente":       'bg-yellow-100 text-yellow-700',
      "En preparacion":  'bg-blue-100 text-blue-700',
      "Entregado":       'bg-green-100 text-green-700'
    };
    return classes[estado];
  }

  getEstadoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      "Pendiente":       '⏳ Pendiente',
      "En preparacion":  '👨‍🍳 Preparando',
      "Entregado":       '✓ Entregado'
    };
    return labels[estado];
  }

  // ACCIONES
  callWaiter(): void {
    if (this.waiterCalled()) return;

    this.waiterCalled.set(true);
    
    // Vibración de confirmación
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // TODO: Enviar notificación al mozo via API/WebSocket

    // Cooldown de 60 segundos para no spamear
    this.waiterCooldownTimer = setTimeout(() => {
      this.waiterCalled.set(false);
    }, 60000);
  }

  confirmCloseSession(): void {
    this.showCloseConfirm.set(true);
  }

  closeSession(): void {
    // Limpiar localStorage
    localStorage.removeItem('mesaSession');
    localStorage.removeItem('userSession');

    // Navegar a la home
    this.router.navigate(['/']);
  }
}
