import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart';
import { PedidoService } from '../../core/services/pedido';
import { Auth } from '../../core/services/auth';
import { firstValueFrom } from 'rxjs';

type MetodoPago = 'efectivo' | 'app' | 'tarjeta';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  // Servicios
  private cartService = inject(CartService);
  public authService = inject(Auth);
  private pedidoService = inject(PedidoService);

  // Signals
  pedidoNuevo = this.pedidoService.pedidoNuevo; 
  mesa = this.authService.mesa;
  user = this.authService.user;
  cartItems = this.cartService.cart; // Carrito
  notaGeneral = signal(''); // Nota general del pedido
  selectedPayment = signal<MetodoPago | null>(null); // Método de pago

  pedidoPadreId = this.pedidoService.pedidoStorage()?.pedido.pedido_id;

  // Estados
  isProcessing = signal(false);
  showConfirmation = signal(false);

  // COMPUTED
  subtotal = computed(() => 
    this.cartItems().reduce((sum, item) => 
      sum + (item.producto.precio_unitario * item.cantidad), 0
    )
  );

  iva = computed(() => 
    Math.round(this.subtotal() * 0.21 * 100) / 100
  );

  total = computed(() => 
    this.subtotal() + this.iva()
  );

  getTotalItems(): number {
    return this.cartItems().reduce((sum, item) => sum + item.cantidad, 0);
  }

  // MÉTODOS
  selectPaymentMethod(method: MetodoPago): void {
    this.selectedPayment.set(method);
  }

  async confirmOrder(): Promise<void> {
    if (!this.selectedPayment() || this.isProcessing()) return;
  
    // Validaciones
    if (!this.user()?.cliente_id || !this.mesa()?.mesa_id) {
      alert('Error: Faltan datos de sesión. Por favor, volvé a escanear el QR.');
      return;
    }
  
    if (this.cartItems().length === 0) {
      alert('El carrito está vacío');
      return;
    }
  
    this.isProcessing.set(true);
  
    try {
      const productos = this.cartItems().map(item => ({
        producto_id: item.producto.producto_id,
        cantidad: item.cantidad,
        precio_unitario: Number(item.producto.precio_unitario)
      }));
  
      const pedidoData = {
        cliente_id: <string>this.user()?.cliente_id,
        cliente_nombre: <string>this.user()?.nombre,
        mesa_id: <string>this.mesa()?.mesa_id,
        productos: productos,
        nota: this.notaGeneral() || '',
        ...(this.pedidoPadreId && { pedido_padre_id: this.pedidoPadreId })
      };
  
      // ✨ Una sola llamada que maneja todo el flujo
      await firstValueFrom(
        this.pedidoService.createPedidoConPago(pedidoData, this.selectedPayment()!)
      );
  
      // Limpiar carrito
      this.cartService.clearCart();
  
      // Mostrar confirmación
      this.showConfirmation.set(true);
  
      // Vibración de éxito
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
  
    } catch (error: any) {
      // ... tu manejo de errores actual ...
    } finally {
      this.isProcessing.set(false);
    }
  }
}
