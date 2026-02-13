import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Calificacion } from '../interfaces/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class CalificacionService {
  private apiUrl = `${environment.apiUrl}calificacion/`;
  private http = inject(HttpClient);

  // Estados
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  createCalificacion(data: Calificacion): Observable<Calificacion> {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    return this.http.post<Calificacion>(`${this.apiUrl}crear`, data).pipe(
      tap((response) => {
        this.success.set('Calificación enviada exitosamente');
        console.log('⭐ Calificación creada:', response);
      }),
      catchError(err => {
        this.error.set('Error al enviar calificación');
        console.error('❌ Error al calificar:', err);
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Obtener calificación de un pedido
   */
  getCalificacionByPedido(pedidoId: string): Observable<Calificacion> {
    return this.http.get<Calificacion>(`${this.apiUrl}pedido/${pedidoId}`);
  }

  /**
   * Verificar si un pedido tiene calificación
   */
  pedidoTieneCalificacion(pedidoId: string): Observable<boolean> {
    return this.http.get<{tiene_calificacion: boolean}>(`${this.apiUrl}verificar/${pedidoId}`)
      .pipe(
        tap(response => console.log(`Pedido ${pedidoId} calificado:`, response.tiene_calificacion)),
        catchError(() => {
          // Si hay error, asumir que no tiene calificación
          return throwError(() => false);
        })
      ) as any;
  }
}
