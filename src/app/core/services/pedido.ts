import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, firstValueFrom, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, Product } from '../interfaces/product';
import { ProductoPedido, CreatePedidoDTO, CreatePagoDTO, PedidoResponse, PagoResponse } from '../interfaces/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class Pedido {
  private apiUrlPedido = `${environment.apiUrl}pedido/`;
  private apiUrlPago = `${environment.apiUrl}pago/`;

  // Inject
  private http = inject(HttpClient);

  // Signals de estado
  pedidoNuevo = signal<PedidoResponse | null>(null);
  pedidosMesa = signal<Pedido[]>([]);
  pedido = signal<PedidoResponse | null>(null);
  loadingPedido = signal(false);
  errorPedido = signal<string | null>(null);
  successPedido = signal<string | null>(null);

  loadingPago = signal(false);
  errorPago = signal<string | null>(null);
  successPago = signal<string | null>(null);

  createPedido(pedidoData: CreatePedidoDTO): void {
    this.loadingPedido.set(true);
    this.errorPedido.set(null);

    this.http.post<PedidoResponse>(`${this.apiUrlPedido}crear`, pedidoData).pipe(
      tap((data) => {
        console.log('Respuesta de crear pedido:', data);
        this.successPedido.set("Pedido creado exitosamente");
        this.pedido.set(data);

      }),
      catchError(err => {
        this.errorPedido.set('Error al crear pedido');
        console.error(err);
        return of(null);
      }), 
      finalize(() => this.loadingPedido.set(false))
    ).subscribe();
  }

  createPago(pagoData: CreatePagoDTO): void {
    this.loadingPago.set(true);
    this.errorPago.set(null);

    this.http.post<PagoResponse>(`${this.apiUrlPago}crear`, pagoData).pipe(
      tap((data) => {
        console.log('Respuesta de crear pago:', data);
        this.successPago.set("Pago creado exitosamente");
      }),
      catchError(err => {
        this.errorPago.set('Error al crear pago');
        console.error(err);
        return of(null);
      }), 
      finalize(() => this.loadingPago.set(false))
    ).subscribe();
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

  getPedidoById(idPedido: string): void {
    this.loadingPedido.set(true);
    this.errorPedido.set(null);
    
    this.http.get<PedidoResponse>(`${this.apiUrlPedido}pedidos/${idPedido}`).pipe(
      tap((data) => {
        this.pedido.set(data)
      }),
      catchError(err => {
        this.errorPedido.set('Error al obtener pedido');
        console.error(err);
        return of(null);
      }),
      finalize(() => this.loadingPedido.set(false))
    ).subscribe();
  }
}
