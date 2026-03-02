import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';
import { Mesa } from '../interfaces/mesa.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root',
})
export class MesaService {
  private apiUrl = `${environment.apiUrl}mesa/`;

  // Servicios
  private http = inject(HttpClient);
  private ts = inject(ToastService);

  // Signals de estado
  mesa = signal<Mesa | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  getMesa(idMesa: string): void {
    this.loading.set(true);
    
    this.http.get<Mesa>(`${this.apiUrl}mesa/${idMesa}`).pipe(
      tap((data) => {
        this.mesa.set(data)
      }),
      catchError(err => {
        this.ts.error('Error al obtener mesa', err.error.message);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }
}
