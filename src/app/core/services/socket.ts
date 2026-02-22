import { Injectable, signal, inject, computed } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private authService = inject(Auth);
  
  private socket: Socket | null = null;
  
  // Signals
  connectionStatus = signal<ConnectionStatus>('disconnected');
  isConnected = computed(() => this.connectionStatus() === 'connected');
  lastPingTime = signal<Date | null>(null);
  
  // Estadísticas
  reconnectAttempts = signal(0);
  connectionError = signal<string | null>(null);

  constructor() {
    // Auto-conectar si hay sesión activa
    if (this.authService.isAuthenticated()) {
      this.connect();
    }
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket ya conectado');
      return;
    }

    this.connectionStatus.set('connecting');
    this.connectionError.set(null);

    this.socket = io(environment.socketUrl || environment.apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    // Conexión exitosa
    this.socket.on('connect', () => {
      console.log('✅ Socket conectado:', this.socket?.id);
      this.connectionStatus.set('connected');
      this.reconnectAttempts.set(0);
      this.connectionError.set(null);

      // Autenticarse con el backend
      this.authenticate();
    });

    // Desconexión
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
      this.connectionStatus.set('disconnected');
    });

    // Error de conexión
    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      this.connectionStatus.set('error');
      this.connectionError.set('Error al conectar con el servidor');
      this.reconnectAttempts.update(v => v + 1);
    });

    // Autenticación exitosa
    this.socket.on('authenticated', (data) => {
      console.log('🔐 Autenticado:', data);
    });

    // Pong (respuesta del servidor)
    this.socket.on('pong', () => {
      this.lastPingTime.set(new Date());
    });

    // Reconexión
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconectado después de', attemptNumber, 'intentos');
      this.connectionStatus.set('connected');
      this.reconnectAttempts.set(0);
      this.authenticate();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Intento de reconexión:', attemptNumber);
      this.connectionStatus.set('connecting');
      this.reconnectAttempts.set(attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Error al reconectar:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Fallo total de reconexión');
      this.connectionStatus.set('error');
      this.connectionError.set('No se pudo reconectar al servidor');
    });
  }

  private authenticate() {
    if (!this.socket || !this.authService.isAuthenticated()) return;

    const user = this.authService.currentUser();
    const sesion = this.authService.currentMesaSession();
    const token = this.authService.getToken();

    this.socket.emit('authenticate', {
      userId: user?.cliente_id,
      userRole: 'cliente',
      mesaId: sesion?.mesa,
      sesionId: token
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus.set('disconnected');
    }
  }

  // Método para enviar eventos
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket no conectado. No se puede emitir:', event);
    }
  }

  // Método para escuchar eventos
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Método para dejar de escuchar eventos
  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Ping manual
  sendPing() {
    this.emit('ping');
  }

  // Cleanup
  ngOnDestroy() {
    this.disconnect();
  }
}
