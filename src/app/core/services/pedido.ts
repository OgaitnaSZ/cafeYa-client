import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, CreatePagoDTO, PedidoResponse, PagoResponse, PedidoData, Calificacion, PedidoEstado, MedioPago } from '../interfaces/pedido.model';
import { CambioEstadoPedidoPayload, SocketService } from './socket';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private apiUrlPedido = `${environment.apiUrl}pedido/`;
  private apiUrlPago = `${environment.apiUrl}pago/`;

  // Servicios
  private http = inject(HttpClient);
  private ts = inject(ToastService);

  // Signals de estado
  pedidoNuevo = signal<Pedido | null>(null);
  pedido = signal<Pedido | null>(null);
  pedidosMesa = signal<PedidoData[]>(this.getStoredPedidos());
  loadingPedido = signal(false);
  errorPedido = signal<string | null>(null);
  successPedido = signal<string | null>(null);
  loadingPago = signal(false);
  errorPago = signal<string | null>(null);
  successPago = signal<string | null>(null);

  // Computed para obtener el último pedido
  ultimoPedido = computed(() => {
    const pedidos = this.pedidosMesa();
    return pedidos.length > 0 ? pedidos[pedidos.length - 1] : null;
  });

  // Computed para obtener el pedido padre (primer pedido de la sesión)
  pedidoPadre = computed(() => {
    const pedidos = this.pedidosMesa();
    return pedidos.length > 0 ? pedidos[0] : null;
  });

  // Computed para los totales pedidos
  readonly totalPedidos = computed(() =>
    this.pedidosMesa().length
  );

  // Computed para los totales pedidos pendientes
  readonly totalPedidosPendientes = computed(() =>
    this.pedidosMesa().filter(p => p.estado === 'Pendiente' || p.estado === 'En_preparacion').length
  );

  // Computed para los totales pedidos pendientes
  readonly totalPedidosServidos = computed(() =>
    this.pedidosMesa()
      .filter(pedido => pedido.estado === 'Entregado')
      .length
  );

  // Computed para el total de la sesión
  totalSesion = computed(() => {
    return this.pedidosMesa().reduce((precio_total, pedido) => precio_total + pedido.precio_total, 0);
  });

  constructor() {
    effect(() => {
      const pedidos = this.pedidosMesa();
      if (pedidos.length > 0) {
        localStorage.setItem("pedidosMesa", JSON.stringify(pedidos));
      } else {
        localStorage.removeItem("pedidosMesa");
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.sincronizarSiHayActivos();
      }
    });
  }

  initSocketListeners(socketService: SocketService) {
    effect(() => {
      const cambio = socketService.ultimoCambioEstado();
      if (cambio) {
        this.actualizarEstadoPedido(cambio);
      }
    });

    // Sincronizar estado de pedidos cuando Socket.io reconecta
    effect(() => {
      const reconexiones = socketService.reconectado();
      if (reconexiones > 0) {
        this.sincronizarSiHayActivos();
      }
    });
  }

  private sincronizarSiHayActivos(): void {
    const estadosActivos: PedidoEstado[] = [
      PedidoEstado.Pendiente,
      PedidoEstado.EnPreparacion,
      PedidoEstado.Listo
    ];

    const idsActivos = this.pedidosMesa()
      .filter(p => estadosActivos.includes(p.estado))
      .map(p => p.pedido_id);

    if (idsActivos.length === 0) return; 

    this.http.post<{ pedido_id: string; estado: string }[]>(
      `${this.apiUrlPedido}sincronizar-estado`,
      { pedido_ids: idsActivos }
    ).pipe(
      catchError(() => of([])) // Si falla, no romper nada
    ).subscribe(estadosActualizados => {
      if (estadosActualizados.length === 0) return;

      let huboCambios = false;

      this.pedidosMesa.update(pedidos =>
        pedidos.map(p => {
          const actualizado = estadosActualizados.find(e => e.pedido_id === p.pedido_id);
          if (!actualizado) return p;

          const nuevoEstado = this.mapEstado(actualizado.estado);
          if (nuevoEstado === p.estado) return p; // Sin cambio, no tocar

          huboCambios = true;
          return { ...p, estado: nuevoEstado };
        })
      );

      if (huboCambios) {
        this.ts.success('Pedidos actualizados', 'Sincronizamos el estado de tus pedidos.');
      }
    });
  }

  // Helpers
  private getStoredPedidos(): PedidoData[] {
    const stored = localStorage.getItem("pedidosMesa");
    
    if (!stored || stored === 'undefined' || stored === 'null') {
      return [];
    }
  
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error al parsear pedidos almacenados:', e);
      return [];
    }
  }

  createPedidoConPago(pedidoData: Pedido, metodoPago: MedioPago): Observable<{pedido: Pedido, pago: any}> {
    this.loadingPedido.set(true);
  
    return this.http.post<PedidoResponse>(`${this.apiUrlPedido}crear`, pedidoData).pipe(
      tap((response) => {
        this.pedidoNuevo.set(response.pedido);
      }),
      // Encadenar la creación del pago
      switchMap((pedidoResponse) => {
        const pagoData: CreatePagoDTO = {
          pedido_id: <string>pedidoResponse.pedido.pedido_id,
          medio_pago: metodoPago
        };

        return this.createPagoInternal(pagoData).pipe(
          map(pagoResponse => ({
            pedido: pedidoResponse.pedido,
            pago: pagoResponse
          }))
        );
      }),
      tap(({ pedido, pago }) => {
        const nuevoPedidoData: PedidoData = {
          // Datos del pedido
          pedido_id: pedido.pedido_id!,
          numero_pedido: pedido.numero_pedido!,
          cliente_id: pedido.cliente_id,
          cliente_nombre: pedido.cliente_nombre!,
          mesa_id: pedido.mesa_id,
          nota: pedido.nota || '',
          precio_total: Number(pedido.precio_total),
          estado: this.mapEstado(pedido.estado!),
          productos: pedidoData.productos,
          pedido_padre_id: pedido.pedido_padre_id || undefined,
          
          // Datos del pago
          pago_id: pago.pago_id,
          medio_pago: pago.medio_de_pago!,
          monto: Number(pago.monto),
          IVA: Number(pago.IVA),
          monto_final: Number(pago.monto_final),
          fecha_pago: new Date(pago.created_at)
        };

        this.pedidosMesa.update(pedidos => [...pedidos, nuevoPedidoData]);
      }),
      catchError(err => {
        this.ts.error('Error al procesar pedido y pago', err.error.message);
        return throwError(() => err);
      }),
      finalize(() => this.loadingPedido.set(false))
    );
  }

  // Se ejecuta cuando se recibe la notificacion
  actualizarEstadoPedido(data: CambioEstadoPedidoPayload) {
    this.pedidosMesa.update(pedidos =>
      pedidos.map(p =>
        p.pedido_id === data.pedido_id
          ? { ...p, estado: this.mapEstado(data.estado) }
          : p
      )
    );
    this.ts.success( '¡Nuevo estado de tu pedido!.', `Tu pedido #${data.numero_pedido} está ${data.estado}.` );
  }
  
  private createPagoInternal(pagoData: CreatePagoDTO): Observable<PagoResponse> {
    this.loadingPago.set(true);
  
    return this.http.post<PagoResponse>(`${this.apiUrlPago}crear`, pagoData).pipe(
      tap(() => {
        this.successPago.set("Pago creado exitosamente");
      }),
      catchError(err => {
        this.ts.error('Error al procesar el pago', err.error.message);
        return throwError(() => err);
      }),
      finalize(() => this.loadingPago.set(false))
    );
  }

  // Agregar calificación a un pedido en el array local
  agregarCalificacion(pedidoId: string, calificacion: Calificacion): void {
    this.pedidosMesa.update(pedidos => 
      pedidos.map(p => 
        p.pedido_id === pedidoId
          ? {
              ...p,
              calificacion: {
                pedido_id: pedidoId,
                calificacion_id: calificacion.calificacion_id,
                puntuacion: calificacion.puntuacion,
                resena: calificacion.resena,
                nombre_cliente: calificacion.nombre_cliente
              }
            }
          : p
      )
    );
  }

  // Verificar si un pedido está calificado
  pedidoEstaCalificado(pedidoId: string): boolean {
    const pedido = this.getPedidoById(pedidoId);
    return !!pedido?.calificacion;
  }

  // Obtener calificación de un pedido
  getCalificacion(pedidoId: string): PedidoData['calificacion'] | undefined {
    return this.getPedidoById(pedidoId)?.calificacion;
  }

  // Helpers
  mapEstado(estado: string): PedidoEstado {
    switch (estado) {
      case 'Pendiente':
        return PedidoEstado.Pendiente;
      case 'En_preparacion':
        return PedidoEstado.EnPreparacion;
      case 'Listo':
        return PedidoEstado.Listo;
      case 'Entregado':
        return PedidoEstado.Entregado;
      default:
        throw new Error('Estado inválido');
    }
  }

  limpiarSesion(): void {
    this.pedidosMesa.set([]);
    this.errorPedido.set(null);
    this.successPedido.set(null);
    this.errorPago.set(null);
    this.successPago.set(null);
  }
  
  getPedidosByCliente(clienteId: string): PedidoData[] {
    return this.pedidosMesa().filter(p => p.cliente_id === clienteId);
  }

  getPedidosHijos(): PedidoData[] {
    return this.pedidosMesa().filter(p => p.pedido_padre_id);
  }

  public hayPedidosEnSesion(): boolean {
    return this.pedidosMesa().length > 0;
  }

  getPedidoById(pedidoId: string): PedidoData | undefined {
    return this.pedidosMesa().find(p => p.pedido_id === pedidoId);
  }
}
