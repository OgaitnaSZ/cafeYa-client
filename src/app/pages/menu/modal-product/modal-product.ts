import { Component, computed, EventEmitter, inject, input, Input, output, Output, signal } from '@angular/core';
import { CartService } from '../../../core/services/cart';
import { Categoria, Product } from '../../../core/interfaces/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Minus, Plus, ShoppingCart, X } from 'lucide-angular';
Input 

@Component({
  selector: 'app-modal-product',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './modal-product.html',
  styleUrl: './modal-product.css',
})
export class ModalProduct {
  // INPUTS
  selectedProduct = input.required<Product>();
  categoria = input<Categoria>();

  // OUTPUTS
  close = output<void>();

  // Servicios
  cartService = inject(CartService);

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
    if (!product || !product.disponibilidad) return;
  
    this.cartService.addToCart(
      product,
      this.modalQuantity(),
      this.modalNotes()
    );
  
    this.closeProductDetail();
  }

  closeProductDetail(): void {
    // Animar antes de cerrar
    const modal = document.querySelector('.animate-slide-up');
    modal?.classList.add('animate-slide-down');
    
    setTimeout(() => {
      this.resetModal();
      this.close.emit();
      document.body.style.overflow = 'unset';
    }, 250);
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

  onBackdropClick(): void {
    this.closeProductDetail();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  // Icons
  readonly X = X;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly ShoppingCart = ShoppingCart;
}
