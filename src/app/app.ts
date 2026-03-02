import { Component, effect, inject, signal } from '@angular/core';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { BottomBar } from './layout/bottom-bar/bottom-bar';
import { Router } from '@angular/router';
import { filter } from 'rxjs';
import { ToastContainer } from './layout/components/toast/toast-container/toast-container';
import { SocketService } from './core/services/socket';
import { PedidoService } from './core/services/pedido';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomBar, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Services
  private socketService = inject(SocketService);
  private pedidosService = inject(PedidoService);

  hideBottomBar = signal(false);
  activeSession: boolean = false;

  constructor(router: Router) {
    router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      
      const shouldHide = url.startsWith('/login') || url.startsWith('/validate');
      
      this.hideBottomBar.set(shouldHide);
    });

    // Escuchar notificaciones de cambio de estados de pedido en tiempo real
    effect(() => {
      const cambio = this.socketService.ultimoCambioEstado();
      if (cambio) {
        this.pedidosService.actualizarEstadoPedido(cambio);
        this.socketService.ultimoCambioEstado.set(null);
      }
    });
  }
}
