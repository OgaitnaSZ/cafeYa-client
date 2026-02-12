import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, CreatePagoDTO, PedidoResponse, PagoResponse, PedidoData } from '../interfaces/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private apiUrlPedido = `${environment.apiUrl}pedido/`;
  private apiUrlPago = `${environment.apiUrl}pago/`;

  // Inject
  private http = inject(HttpClient);

  // Signals de estado
  pedidoNuevo = signal<Pedido | null>(null);
  pedido = signal<Pedido | null>(null);
  pedidosMesa = signal<PedidoData[]>(this.getStoredPedidos());
  loadingPedido = signal(false);
  errorPedido = signal<string | null>(null);
  successPedido = signal<string | null>(null);

  // Estados
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

  // Computed para el total de la sesión
  totalSesion = computed(() => {
    return this.pedidosMesa().reduce((total, pedido) => total + pedido.monto_final, 0);
  });

  constructor() {
    // Efecto para mantener sincronizado localStorage
    effect(() => {
      const pedidos = this.pedidosMesa();
      
      if (pedidos.length > 0) {
        localStorage.setItem('pedidosMesa', JSON.stringify(pedidos));
      } else {
        localStorage.removeItem('pedidosMesa');
      }
    });
  }

  // Helpers
  private getStoredPedidos(): PedidoData[] {
    const stored = localStorage.getItem('pedidosData');
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

  createPedidoConPago(pedidoData: Pedido, metodoPago: 'efectivo' | 'app' | 'tarjeta'): Observable<{pedido: Pedido, pago: any}> {
    this.loadingPedido.set(true);
    this.errorPedido.set(null);
  
    return this.http.post<PedidoResponse>(`${this.apiUrlPedido}crear`, pedidoData).pipe(
      tap((response) => {
        this.pedidoNuevo.set(response.pedido);
        this.successPedido.set("Pedido creado con éxito");
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
      catchError(err => {
        this.errorPedido.set('Error al procesar pedido y pago');
        console.error(err);
        return throwError(() => err);
      }),
      finalize(() => this.loadingPedido.set(false))
    );
  }
  
  private createPagoInternal(pagoData: CreatePagoDTO): Observable<PagoResponse> {
    this.loadingPago.set(true);
    this.errorPago.set(null);
  
    return this.http.post<PagoResponse>(`${this.apiUrlPago}crear`, pagoData).pipe(
      tap((data) => {
        this.successPago.set("Pago creado exitosamente");
      }),
      catchError(err => {
        this.errorPago.set('Error al crear pago');
        console.error(err);
        return throwError(() => err);
      }),
      finalize(() => this.loadingPago.set(false))
    );
  }
  // Helpers
    // Limpiar todos los pedidos de la sesión
    limpiarSesion(): void {
      this.pedidosMesa.set([]);
      this.errorPedido.set(null);
      this.successPedido.set(null);
      this.errorPago.set(null);
      this.successPago.set(null);
    }
  
    // Obtener pedidos por cliente
    getPedidosByCliente(clienteId: string): PedidoData[] {
      return this.pedidosMesa().filter(p => p.cliente_id === clienteId);
    }
  
    // Obtener pedidos hijos (que tienen pedido_padre_id)
    getPedidosHijos(): PedidoData[] {
      return this.pedidosMesa().filter(p => p.pedido_padre_id);
    }
  
    // Verificar si hay pedidos en la sesión
    hayPedidosEnSesion(): boolean {
      return this.pedidosMesa().length > 0;
    }
  
    // Obtener pedido por ID
    getPedidoById(pedidoId: string): PedidoData | undefined {
      return this.pedidosMesa().find(p => p.pedido_id === pedidoId);
    }
}
