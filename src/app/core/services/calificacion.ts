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
  calificacion = signal<Calificacion | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  createCalificacion(data: Calificacion): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.http.post<Calificacion>(`${this.apiUrl}crear`, data).pipe(
      tap((response) => {
        this.success.set('Calificación enviada exitosamente');
        this.calificacion.set(response);
      }),
      catchError(err => {
        this.error.set('Error al enviar calificación');
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  // Obtener calificación de un pedido
  getCalificacionByPedido(pedidoId: string): Observable<Calificacion> {
    return this.http.get<Calificacion>(`${this.apiUrl}pedido/${pedidoId}`);
  }
}
