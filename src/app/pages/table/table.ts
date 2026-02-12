import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type EstadoPedido = 'pendiente' | 'en_preparacion' | 'entregado';

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
private router = inject(Router);

  // Datos de la mesa (desde localStorage o sesión)
  mesaNumber = signal('5');
  mesaCode = signal('2847');
  sessionStartTime = signal('14:32');
  sessionDuration = signal('00:45');

  // Estado UI
  showCloseConfirm = signal(false);
  waiterCalled = signal(false);
  private waiterCooldownTimer: any;
  private durationTimer: any;

  // Pedidos activos de la sesión
  pedidosActivos = signal<PedidoResumen[]>([
    {
      id: '001',
      items: [{}, {}],
      total: 2400,
      estado: 'en_preparacion',
      fecha: new Date()
    },
    {
      id: '002',
      items: [{}],
      total: 1200,
      estado: 'pendiente',
      fecha: new Date()
    }
  ]);

  // Todos los pedidos de la sesión (para el total)
  todosPedidos = signal<PedidoResumen[]>([
    {
      id: '000',
      items: [{}, {}, {}],
      total: 3800,
      estado: 'entregado',
      fecha: new Date()
    },
    ...this.pedidosActivos()
  ]);

  // COMPUTED
  totalPedidos = computed(() => this.todosPedidos().length);
  
  totalItems = computed(() => 
    this.todosPedidos().reduce((sum, p) => sum + p.items.length, 0)
  );
  
  totalAcumulado = computed(() =>
    this.todosPedidos().reduce((sum, p) => sum + p.total, 0)
  );

  ngOnInit(): void {
    this.loadSessionData();
    this.startDurationTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.durationTimer);
    clearTimeout(this.waiterCooldownTimer);
  }

  private loadSessionData(): void {
    // Cargar desde localStorage o servicio de sesión
    const session = JSON.parse(localStorage.getItem('mesaSession') || '{}');
    
    if (session.mesaNumber) this.mesaNumber.set(session.mesaNumber);
    if (session.mesaCode) this.mesaCode.set(session.mesaCode);
    if (session.startTime) {
      const date = new Date(session.startTime);
      this.sessionStartTime.set(
        date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      );
    }
  }

  private startDurationTimer(): void {
    this.durationTimer = setInterval(() => {
      const session = JSON.parse(localStorage.getItem('mesaSession') || '{}');
      if (session.startTime) {
        const start = new Date(session.startTime);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60).toString().padStart(2, '0');
        const mins = (diffMins % 60).toString().padStart(2, '0');
        this.sessionDuration.set(`${hours}:${mins}`);
      }
    }, 60000);
  }

  // BADGE HELPERS
  getEstadoBadgeClass(estado: EstadoPedido): string {
    const classes: Record<EstadoPedido, string> = {
      pendiente:       'bg-yellow-100 text-yellow-700',
      en_preparacion:  'bg-blue-100 text-blue-700',
      entregado:       'bg-green-100 text-green-700'
    };
    return classes[estado];
  }

  getEstadoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      pendiente:       '⏳ Pendiente',
      en_preparacion:  '👨‍🍳 Preparando',
      entregado:       '✓ Entregado'
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
