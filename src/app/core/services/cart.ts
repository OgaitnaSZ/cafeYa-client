import { computed, effect, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Signals de estado
  cart = signal<CartItem[]>(this.getStoredCart());
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Computed Estados
  readonly itemCount = computed(() =>
    this.cart().reduce((total, item) => total + item.cantidad, 0)
  );
  readonly totalPrice = computed(() => {
    return this.cart().reduce((total, item) => total + (item.producto.precio_unitario * item.cantidad), 0);
  });

  constructor() {
    // Efecto para mantener sincronizado localStorage
    effect(() => {
      const cart = this.cart();
      if (cart && cart.length > 0) localStorage.setItem('cart', JSON.stringify(cart));
      else localStorage.removeItem('cart');
    });
  }

  // Métodos para manipular el carrito
  addToCart(producto: Product, cantidad: number = 1, notas: string = ''): void {
    this.cart.update(cart => {
      const existingItem = cart.find(item => item.producto.producto_id === producto.producto_id);
      if (existingItem) {
        return cart.map(item => 
          item.producto.producto_id === producto.producto_id 
            ? { ...item, cantidad: item.cantidad + cantidad, notas: item.notas + (item.notas ? ' | ' : '') + notas } 
            : item
        );
      } else {
        return [...cart, { producto, cantidad, notas}];
      }
    });
  }

  removeFromCart(productId: string): void {
    this.cart.update(cart => cart.filter(item => item.producto.producto_id !== productId));
  }

  resetCart(): void {
    this.cart.set([]);
  }

  private getStoredCart(): CartItem[] {
    const stored = localStorage.getItem('cart');
    if (!stored || stored === 'undefined' || stored === 'null') {
      return [];
    }

    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error al parsear carrito almacenado:', e);
      return [];
    }
  }
}