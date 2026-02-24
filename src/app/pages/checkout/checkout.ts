import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart';
import { PedidoService } from '../../core/services/pedido';
import { Auth } from '../../core/services/auth';
import { firstValueFrom } from 'rxjs';
import { 
  Banknote,
  Check,
  ChevronLeft,
  Clipboard,
  Info,
  LucideAngularModule,
  QrCode, 
 } from 'lucide-angular';
import { Header } from '../../layout/components/header/header';
import { ToastService } from '../../core/services/toast';

type MetodoPago = 'efectivo' | 'app' | 'tarjeta';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, Header],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  // Servicios
  private cartService = inject(CartService);
  public authService = inject(Auth);
  private pedidoService = inject(PedidoService);
  private toastService = inject(ToastService);

  // Signals
  pedidoNuevo = this.pedidoService.pedidoNuevo; 
  mesa = this.authService.mesa;
  user = this.authService.user;
  cartItems = this.cartService.cart; // Carrito
  notaGeneral = signal(''); // Nota general del pedido
  selectedPayment = signal<MetodoPago | null>(null); // Método de pago

  pedidoPadre = this.pedidoService.pedidoPadre();

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
      return this.toastService.error( 'Faltan datos de sesión.', 'Por favor, volvé a escanear el QR.' );
    }
  
    if (this.cartItems().length === 0) {
      this.toastService.error(
        'El carrito está vacío',
        'Agrega productos'
      );
      return
    }
  
    this.isProcessing.set(true);
  
    try {
      const productos = this.cartItems().map(item => ({
        producto: item.producto,
        cantidad: item.cantidad,
        precio_unitario: Number(item.producto.precio_unitario),
        notas: item.notas
      }));
  
      const pedidoData = {
        cliente_id: <string>this.user()?.cliente_id,
        cliente_nombre: <string>this.user()?.nombre,
        mesa_id: <string>this.mesa()?.mesa_id,
        productos: productos,
        nota: this.notaGeneral() || '',
        ...(this.pedidoPadre?.pedido_id && { pedido_padre_id: this.pedidoPadre?.pedido_id })
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
      this.toastService.success(
        '¡Pedido confirmado!',
        'Tu pedido está siendo preparado'
      );
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
  
    } catch (error: any) {
      this.toastService.error(
        'Error al procesar pedido',
        'Intentá nuevamente en unos momentos'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly Banknote = Banknote;
  readonly QrCode = QrCode;
  readonly Check = Check;
  readonly Info = Info;
  readonly Clipboard = Clipboard;
}
