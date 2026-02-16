import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/interfaces/product';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-products-list-grid',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './products-list-grid.html',
  styleUrl: './products-list-grid.css',
})
export class ProductsListGrid {
  // INPUTS
  products = input.required<Product[]>();

  // OUTPUTS
  productClick = output<Product>();
  addToCartClick = output<Product>();

  // MÉTODOS
  openProductDetail(product: Product): void {
    this.productClick.emit(product);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.addToCartClick.emit(product);
  }

  // Track by para performance
  trackByProductId(index: number, product: Product): string {
    return product.producto_id;
  }

  // Icons
  readonly Plus = Plus;
}
