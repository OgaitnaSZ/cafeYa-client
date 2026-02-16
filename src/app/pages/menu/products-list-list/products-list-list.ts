import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/interfaces/product';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-products-list-list',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './products-list-list.html',
  styleUrl: './products-list-list.css',
})
export class ProductsListList {
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
