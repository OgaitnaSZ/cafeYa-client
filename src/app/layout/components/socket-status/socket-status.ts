import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService, ConnectionStatus } from '../../../core/services/socket';

@Component({
  selector: 'app-socket-status',
  imports: [CommonModule],
  templateUrl: './socket-status.html',
  styleUrl: './socket-status.css',
})
export class SocketStatus {
  private socketService = inject(SocketService);

  connectionStatus = this.socketService.connectionStatus;
  isConnected = this.socketService.isConnected;
  reconnectAttempts = this.socketService.reconnectAttempts;
  connectionError = this.socketService.connectionError;
  lastPingTime = this.socketService.lastPingTime;

  // Computed para el texto del estado
  statusText = computed(() => {
    const status = this.connectionStatus();
    const attempts = this.reconnectAttempts();
    
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return attempts > 0 ? `Reconectando (${attempts})` : 'Conectando...';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Error de conexión';
      default:
        return 'Desconocido';
    }
  });

  // Computed para el color del indicador
  statusColor = computed(() => {
    const status = this.connectionStatus();
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  });

  constructor() {
    effect(() => {
      if (!this.isConnected()) {
        return;
      }
  
      const interval = setInterval(() => {
        this.socketService.sendPing();
      }, 30000);
  
      return () => clearInterval(interval);
    });
  }

  // Intentar reconectar manualmente
  reconnect() {
    this.socketService.disconnect();
    setTimeout(() => {
      this.socketService.connect();
    }, 500);
  }
}
