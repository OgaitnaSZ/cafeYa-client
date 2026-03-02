import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Calificacion } from '../interfaces/pedido.model';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root',
})
export class CalificacionService {
  private apiUrl = `${environment.apiUrl}calificacion/`;
  
  // Servicios
  private http = inject(HttpClient);
  private ts = inject(ToastService);

  // Estados
  calificacion = signal<Calificacion | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  createCalificacion(data: Calificacion): Observable<Calificacion> {
    this.loading.set(true);
  
    return this.http.post<Calificacion>(`${this.apiUrl}crear`, data).pipe(
      tap((response) => {
        this.calificacion.set(response);
        this.ts.success('Calificación enviada exitosamente');
      }),
      catchError(err => {
        this.ts.error('Error al enviar calificación', err.error.message);
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}
