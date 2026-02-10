import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../core/services/cart';
import { Router, RouterLink } from '@angular/router';
import { CartItem, Product } from '../../core/interfaces/product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  // Servicios
  private cartService = inject(CartService);
  private router = inject(Router);

  // Estado del carrito
  cartItems = this.cartService.cart;

  // Propina
  showTipSelector = signal(false);
  selectedTip = signal(10); // Porcentaje de propina por defecto
  tipOptions = [0, 5, 10, 15];

  // Modal de confirmación
  showClearConfirm = signal(false);

  // Número de mesa (desde localStorage o servicio)
  mesaNumber = '5'; // TODO: Obtener desde el servicio de sesión

  // COMPUTED PROPERTIES
  getTotalItems(): number {
    return this.cartItems().reduce((sum, item) => sum + item.cantidad, 0);
  }

  getSubtotal(): number {
    return this.cartItems().reduce((sum, item) => 
      sum + (item.producto.precio_unitario * item.cantidad), 0
    );
  }

  getTipAmount(): number {
    return Math.round((this.getSubtotal() * this.selectedTip()) / 100);
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTipAmount();
  }

  getItemTotal(item: CartItem): number {
    return item.producto.precio_unitario * item.cantidad;
  }

  // MÉTODOS DE CARRITO
  increaseQuantity(producto: Product): void {
    this.cartService.addToCart(producto, 1, '');
  }

  decreaseQuantity(producto: Product): void {
    const item = this.cartItems().find(i => i.producto.producto_id === producto.producto_id);
    if (item && item.cantidad > 1) {
      this.cartService.updateQuantity(producto, item.cantidad - 1);
    } else {
      this.removeFromCart(producto);
    }
  }

  removeFromCart(producto: Product): void {
    this.cartService.removeFromCart(producto);
  }

  confirmClearCart(): void {
    this.showClearConfirm.set(true);
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.showClearConfirm.set(false);
  }

  // PROPINA
  toggleTipSelector(): void {
    this.showTipSelector.update(v => !v);
  }

  selectTip(percentage: number): void {
    this.selectedTip.set(percentage);
    this.showTipSelector.set(false);
  }

  // TRACK BY para performance
  trackByProductId(index: number, item: CartItem): string {
    return item.producto.producto_id;
  }
}
