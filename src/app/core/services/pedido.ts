import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, CreatePagoDTO, PedidoResponse, PagoResponse } from '../interfaces/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private apiUrlPedido = `${environment.apiUrl}pedido/`;
  private apiUrlPago = `${environment.apiUrl}pago/`;

  // Inject
  private http = inject(HttpClient);

  // Signals de estado
  pedidoStorage = signal<PedidoResponse | null>(this.getStoredPedido());
  pedidoNuevo = signal<Pedido | null>(null);
  pedidosMesa = signal<Pedido[]>([]);
  pedido = signal<Pedido | null>(null);
  loadingPedido = signal(false);
  errorPedido = signal<string | null>(null);
  successPedido = signal<string | null>(null);

  loadingPago = signal(false);
  errorPago = signal<string | null>(null);
  successPago = signal<string | null>(null);

  constructor() {
    // Efecto para mantener sincronizado localStorage
    effect(() => {
      const pedido = this.pedidoStorage();
  
      if (pedido) {
        localStorage.setItem('pedido', JSON.stringify(pedido));
      } else {
        localStorage.removeItem('pedido');
      }

    });
  }

  getPedidosByMesa(idMesa: string): void {
    this.loadingPedido.set(true);
    this.errorPedido.set(null);
    
    this.http.get<Pedido[]>(`${this.apiUrlPedido}pedidos/mesa/${idMesa}`).pipe(
      tap((data) => {
        this.pedidosMesa.set(data)
      }),
      catchError(err => {
        this.errorPedido.set('Error al obtener mesa');
        console.error(err);
        return of(null);
      }),
      finalize(() => this.loadingPedido.set(false))
    ).subscribe();
  }

  // Helpers
  private getStoredPedido(): PedidoResponse | null {
    const stored = localStorage.getItem('pedido');
    if (!stored || stored === 'undefined' || stored === 'null') {
      return null;
    }
  
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error al parsear pedido almacenado:', e);
      return null;
    }
  }



  createPedidoConPago(pedidoData: Pedido, metodoPago: 'efectivo' | 'app' | 'tarjeta'): Observable<{pedido: Pedido, pago: any}> {
    this.loadingPedido.set(true);
    this.errorPedido.set(null);
  
    return this.http.post<PedidoResponse>(`${this.apiUrlPedido}crear`, pedidoData).pipe(
      tap((response) => {
        this.pedidoNuevo.set(response.pedido);
        this.successPedido.set("Pedido creado con éxito");
        console.log("Pedido creado:", response);
      }),
      // Encadenar la creación del pago
      switchMap((pedidoResponse) => {
        const pagoData: CreatePagoDTO = {
          pedido_id: <string>pedidoResponse.pedido.pedido_id,
          medio_pago: metodoPago
        };

        console.log("Datos para pago:", pagoData);
        
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
}
