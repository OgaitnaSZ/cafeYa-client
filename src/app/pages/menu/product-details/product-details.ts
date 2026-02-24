import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CartService } from '../../../core/services/cart';
import { Categoria, Product } from '../../../core/interfaces/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Minus, Plus, ShoppingCart, X } from 'lucide-angular';
import { BottomSheet } from '../../../layout/components/bottom-sheet/bottom-sheet';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule, LucideAngularModule, BottomSheet],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  // INPUTS
  selectedProduct = input.required<Product>();
  categoria = input<Categoria>();
  isOpen = input<boolean>(true);

  // OUTPUTS
  close = output<void>();

  // Servicios
  cartService = inject(CartService);
  toastService = inject(ToastService);

  // STATE INTERNO
  modalQuantity = signal(1);
  modalNotes = signal('');

  // COMPUTED: Total del modal
  modalTotal = computed(() => {
    const product = this.selectedProduct();
    return product.precio_unitario * this.modalQuantity();
  });

  // MÉTODOS
  addToCartFromModal(): void {
    const product = this.selectedProduct();
    if (!product || product.stock == 0) return;
  
    this.cartService.addToCart(
      product,
      this.modalQuantity(),
      this.modalNotes()
    );

    this.toastService.success('Añadido al carrito',`x${this.modalQuantity()} ${product.nombre}`)
  
    this.closeProductDetail();
  }

  closeProductDetail(): void {
    this.resetModal();
    this.close.emit();
  }

  increaseQuantity(): void {
    this.modalQuantity.update(q => q + 1);
  }

  decreaseQuantity(): void {
    this.modalQuantity.update(q => q > 1 ? q - 1 : 1);
  }

  private resetModal(): void {
    this.modalQuantity.set(1);
    this.modalNotes.set('');
  }

  // Icons
  readonly X = X;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly ShoppingCart = ShoppingCart;
}
