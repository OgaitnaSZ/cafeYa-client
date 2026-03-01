import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth';
import { MesaService } from '../../core/services/mesa';
import { PedidoService } from '../../core/services/pedido';
import { 
  LogOut,
  LucideAngularModule,
  Clipboard,
  ShoppingCart,
  CircleDollarSign,
  Headset,
  Check,
  ChevronRight
} from 'lucide-angular';
import { BadgeConfig, Header } from '../../layout/components/header/header';
import { SocketService } from '../../core/services/socket';
import { ToastService } from '../../core/services/toast';

type EstadoPedido = 'Pendiente' | 'En_preparacion' | 'Listo' | 'Entregado';
@Component({
  selector: 'app-table',
  imports: [CommonModule, LucideAngularModule, Header],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  // Servicios
  public auth = inject(Auth);
  public mesaService = inject(MesaService);
  public pedidosService = inject(PedidoService);
  private toastService = inject(ToastService);
  private socketService = inject(SocketService);

  // Signals
  mesa = this.auth.currentMesa;
  user = this.auth.currentUser;
  pedidos = this.pedidosService.pedidosMesa;

  // Datos de la mesa (desde localStorage o sesión)
  private durationTimer: any;
  currentTime = signal(Date.now());
  mesaSession = this.auth.currentMesaSession;

  // Estado de conexión del socket
  connectionStatus = this.socketService.connectionStatus;
  isConnected = this.socketService.isConnected;
  reconnectAttempts = this.socketService.reconnectAttempts;

  // Estado UI
  showCloseConfirm = signal(false);
  waiterCalled = signal(false);
  private waiterCooldownTimer: ReturnType<typeof setTimeout> | null = null;

  badgeConfig = computed<BadgeConfig>(() => {
    const status = this.connectionStatus();
    const attempts = this.reconnectAttempts();

    switch (status) {
      case 'connected':
        return {
          text: 'Conectado',
          color: 'green',
          pulse: true
        };
      
      case 'connecting':
        return {
          text: attempts > 0 ? `Reconectando (${attempts})` : 'Conectando...',
          color: 'yellow',
          pulse: true
        };
      
      case 'disconnected':
        return {
          text: 'Desconectado',
          color: 'gray',
          pulse: false
        };
      
      case 'error':
        return {
          text: 'Sin conexión',
          color: 'red',
          pulse: true
        };
      
      default:
        return {
          text: 'Desconocido',
          color: 'gray',
          pulse: false
        };
    }
  });

  reconnect() {
    this.socketService.disconnect();
    setTimeout(() => {
      this.socketService.connect();
    }, 500);
  }

  duracionEstimada = computed(() => {
    const user = this.user();
    return user?.duracion_minutos || 45; 
  });

  sessionStartTimeFormatted = computed(() => {
    const session = this.mesaSession();
    if (!session) return '--:--';
    
    const date = new Date(session.sessionStartTime);
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  });

  sessionDurationFormatted = computed(() => {
    const session = this.mesaSession();
    if (!session) return '00:00';
    
    const now = this.currentTime();
    const diffMs = now - session.sessionStartTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  });

  sessionElapsedText = computed(() => {
    const session = this.mesaSession();
    if (!session) return 'Sin sesión';
    
    const now = this.currentTime();
    const diffMs = now - session.sessionStartTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace menos de 1 min';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours === 1) return `Hace 1 hora y ${mins} min`;
    return `Hace ${hours} horas y ${mins} min`;
  });

  private startDurationTimer(): void {
    this.durationTimer = setInterval(() => {
      this.currentTime.set(Date.now());
    }, 60000);
  }

  // BADGE HELPERS
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
      "Pendiente": '⏳ Pendiente',
      "En_preparacion": '👨‍🍳 Preparando',
      "Listo": 'Listo',
      "Entregado": '✓ Entregado'
    };
    return labels[estado];
  }

  // ACCIONES
  callWaiter(): void {
    if (this.waiterCalled()) return;
  
    this.waiterCalled.set(true);
  
    // Emitir evento al backend → backend lo redirige a admin-room
    this.socketService.emit('mozo:llamada');
  
    // Escuchar confirmación del backend
    this.socketService.on('mozo:llamada-confirmada', () => {
      this.toastService.success('Llamando al mozo...', 'En un instante te atenderá');
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  
      // Dejar de escuchar hasta el próximo uso
      this.socketService.off('mozo:llamada-confirmada');
    });
  
    // Cooldown de 60 segundos
    if (this.waiterCooldownTimer) clearTimeout(this.waiterCooldownTimer);
    this.waiterCooldownTimer = setTimeout(() => {
      this.waiterCalled.set(false);
    }, 60000);
  }

  confirmCloseSession(): void {
    this.showCloseConfirm.set(true);
  }

  // Icons
  readonly LogOut = LogOut;
  readonly Clipboard = Clipboard;
  readonly ShoppingCart = ShoppingCart;
  readonly CircleDollarSign = CircleDollarSign;
  readonly Headset = Headset;
  readonly ChevronRight = ChevronRight;
  readonly Check = Check;
}
