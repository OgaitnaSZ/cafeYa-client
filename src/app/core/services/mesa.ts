import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';
import { Mesa } from '../interfaces/mesa.model';
import { environment } from '../../../environments/environment';
import { TokenService } from './token';

@Injectable({
  providedIn: 'root',
})
export class MesaService {
  private apiUrl = `${environment.apiUrl}mesa/`;

  // Inject
  private http = inject(HttpClient);

  // Signals de estado
  mesa = signal<Mesa | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  getMesa(idMesa: string): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.get<Mesa>(`${this.apiUrl}mesa/${idMesa}`).pipe(
      tap((data) => {
        this.mesa.set(data)
      }),
      catchError(err => {
        this.error.set('Error al obtener mesa');
        console.error(err);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }
}
