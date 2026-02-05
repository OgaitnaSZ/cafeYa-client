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
  private apiUrl = `${environment.apiUrl}hospedaje/`;

  // Inject
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

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

  validar(mesa: Mesa): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.post(`${this.apiUrl}mesa/${mesa.mesa_id}/validar`, {}, { headers: this.tokenService.createAuthHeaders()}).pipe(
        tap(() => {
          this.success.set("Mesa validada con exito")
        }),
        catchError(err => {
          this.error.set('Error al validar mesa');
          console.error(err);
          return of(null);
        }),
        finalize(() => this.loading.set(false))
    ).subscribe();
  }
}
