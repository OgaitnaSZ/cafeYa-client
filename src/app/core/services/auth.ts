import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from './token';
import { catchError, finalize, of, tap } from 'rxjs';
import { Mesa, MesaValidate } from '../interfaces/mesa.model';
import { MesaSession } from '../interfaces/auth.model';
import { PedidoService } from './pedido';

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})

export class Auth {
  private authUrl = `${environment.apiUrl}cliente/`;
  private mesaUrl = `${environment.apiUrl}mesa/`;

  // Inject
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private pedidoService = inject(PedidoService);

  // Signals de estado
  user = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());
  loadingUser = signal(false);
  errorUser = signal<string | null>(null);
  successUser = signal<string | null>(null);

  mesa = signal<Mesa | null>(this.getStoredMesa());
  mesaSession = signal<MesaSession | null>(this.getStoredMesaSession());
  loadingMesa = signal(false);
  errorMesa = signal<string | null>(null);
  successMesa = signal<string | null>(null);

  // Computed Estados intermedios
  readonly isAuthenticated = computed(() => !!this.user() && !!this.token());
  readonly hasMesa = computed(() => !!this.mesa());

  // Computed Estado completo
  readonly isLoggedIn = computed(() => this.isAuthenticated() && this.hasMesa());

  // Computed útiles
  readonly currentUser = computed(() => this.user());
  readonly currentMesa = computed(() => this.mesa());
  readonly currentMesaSession = computed(() => this.mesaSession());

  readonly sessionStartTime = computed(() => {
    const session = this.mesaSession();
    return session ? new Date(session.sessionStartTime) : null;
  });

  constructor() {
    // Efecto para mantener sincronizado localStorage
    effect(() => {
      const token = this.token();
      const user = this.user();
      const mesa = this.mesa();
      const mesaSession = this.mesaSession();
  
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      if (mesa) localStorage.setItem('mesa', JSON.stringify(mesa));
      else localStorage.removeItem('mesa');

      if (mesaSession) localStorage.setItem('mesaSession', JSON.stringify(mesaSession));
      else  localStorage.removeItem('mesaSession');
    });
  }

  // Login
  login(nombre: string, email: string, telefono: string, duracion_minutos: number): void {
    this.loadingUser.set(true);
    this.errorUser.set(null);

    this.http.post<LoginResponse>(`${this.authUrl}crear`, { nombre, email, telefono }).pipe(
      tap((data) => {
        console.log('Respuesta de login:', data);
        this.successUser.set("Login exitoso");
        this.user.set(data.user);
        this.token.set(data.token);
      }),
      catchError(err => {
        this.errorUser.set('Error al iniciar session');
        console.error(err);
        return of(null);
      }), 
      finalize(() => this.loadingUser.set(false))
    ).subscribe();
  }

  authMesa(mesa: MesaValidate): void {
    this.loadingMesa.set(true);
    this.errorMesa.set(null);
    
    this.http.post<Mesa>(`${this.mesaUrl}validar`, mesa, { headers: this.tokenService.createAuthHeaders()}).pipe(
        tap((data) => {
          this.successMesa.set("Mesa validada con exito");
          this.mesa.set(data);

          const now = Date.now();
          const session: MesaSession = {
            mesa: data,
            sessionStartTime: now, // ← Guardar hora de inicio
            validatedAt: now,
            codigoExpiresAt: now + (5 * 60 * 60 * 1000) // 5 horas
          };
          
          this.mesaSession.set(session);
        }),
        catchError(err => {
          const errorMessage = err.error?.error || err.error?.message || 'Error al validar mesa';
          this.errorMesa.set(errorMessage);
          console.error(err.error);
          return of(null);
        }),
        finalize(() => this.loadingMesa.set(false))
    ).subscribe();
  }

  // Logout
  logout() {
    this.token.set(null);
    this.user.set(null);
    this.mesa.set(null);
    this.mesaSession.set(null);
    this.pedidoService.pedidosMesa.set([]);
    this.router.navigate(['/']);
  }

  logoutMesa() {
    this.mesa.set(null);
    this.mesaSession.set(null);
  }

  logoutUser(){
    this.token.set(null);
    this.user.set(null); 
    this.router.navigate(['/login']);
  }

  // Helpers
  private getStoredUser(): User | null {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined' || stored === 'null') {
      return null;
    }
  
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error al parsear usuario almacenado:', e);
      return null;
    }
  }
  
  private getStoredToken(): string | null {
    const stored = localStorage.getItem('token');
    if (!stored || stored === 'undefined' || stored === 'null') {
      return null;
    }
  
    return stored;
  }

  private getStoredMesa(): Mesa | null {
    const stored = localStorage.getItem('mesa');
    if (!stored || stored === 'undefined' || stored === 'null') {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error al parsear mesa almacenada:', e);
      return null;
    }
  }

  private getStoredMesaSession(): MesaSession | null {
    const stored = localStorage.getItem('mesaSession');
    if (!stored || stored === 'undefined' || stored === 'null') {
      return null;
    }
  
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error al parsear sesión de mesa:', e);
      return null;
    }
  }

  // Resetea el estado de éxito
  resetSuccess(tipo: string): void {
    if (tipo === 'user') this.successUser.set(null);
    if (tipo === 'mesa') this.successMesa.set(null);
  }

  // Accesores públicos (solo lectura)
  get getToken() {
    return this.token.asReadonly();
  }

  get getUser() {
    return this.user.asReadonly();
  }

  get getMesa() {
    return this.mesa.asReadonly();
  }

  get getMesaSession() {
    return this.mesaSession.asReadonly();
  }
}
