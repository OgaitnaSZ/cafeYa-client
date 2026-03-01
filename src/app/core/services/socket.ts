import { Injectable, signal, inject, computed } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';
import { PedidoService } from './pedido';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private authService = inject(Auth);
  private pedidosService: PedidoService | null = null;
  private socket: Socket | null = null;
  
  // Signals
  connectionStatus = signal<ConnectionStatus>('disconnected');
  isConnected = computed(() => this.connectionStatus() === 'connected');
  lastPingTime = signal<Date | null>(null);
  
  // Estadísticas
  reconnectAttempts = signal(0);
  connectionError = signal<string | null>(null);
  ultimoCambioEstado = signal<{ pedido_id: string; numero_pedido: string; mesa_id: string; estado: string } | null>(null);

  constructor() {
    // Auto-conectar si hay sesión activa
    if (this.authService.isLoggedIn()) {
      this.connect();
    }
  }

  connect() {
    if (this.socket?.connected) return;

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
      this.connectionStatus.set('connected');
      this.reconnectAttempts.set(0);
      this.connectionError.set(null);

      this.authenticate();
    });

    // Desconexión
    this.socket.on('disconnect', (reason) => {
      this.connectionStatus.set('disconnected');
    });

    // Error de conexión
    this.socket.on('connect_error', (error) => {
      this.connectionStatus.set('error');
      this.connectionError.set('Error al conectar con el servidor');
      this.reconnectAttempts.update(v => v + 1);
    });

    // Pong (respuesta del servidor)
    this.socket.on('pong', () => {
      this.lastPingTime.set(new Date());
    });

    // Reconexión
    this.socket.on('reconnect', (attemptNumber) => {
      this.connectionStatus.set('connected');
      this.reconnectAttempts.set(0);
      this.authenticate();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.connectionStatus.set('connecting');
      this.reconnectAttempts.set(attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      this.connectionStatus.set('error');
      this.connectionError.set('No se pudo reconectar al servidor');
    });

    this.socket.on('pedido:estado-actualizado', (data: any) => {
      this.ultimoCambioEstado.set(data);
    });
  }

  private authenticate() {
    if (!this.socket || !this.authService.isLoggedIn()) return;

    const user = this.authService.currentUser();
    const mesa = this.authService.currentMesa();
    const token = this.authService.getToken();

    // Enviar datos simples al backend
    const authData = {
      userId: user?.cliente_id,
      userName: user?.nombre,
      userRole: 'cliente',
      mesaId: mesa?.mesa_id,
      mesaNumero: mesa?.numero,
      token: token
    };

    this.socket.emit('authenticate', authData);
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
    }
  }

  // Método para escuchar eventos
  initPedidosListener(pedidosService: any) {
    this.pedidosService = pedidosService;
  }

  on<T = any>(event: string, callback: (data: T) => void) {
    this.socket?.on(event, callback);
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
