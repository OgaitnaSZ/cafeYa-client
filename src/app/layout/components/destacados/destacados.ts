import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { Product } from '../../../core/interfaces/product';

@Component({
  selector: 'app-destacados',
  imports: [RouterLink],
  templateUrl: './destacados.html',
  styleUrl: './destacados.css',
})
export class Destacados {
  // Servicios
  public productoService = inject(ProductService);

  // Signals
  productos = this.productoService.productos;
  error = this.productoService.error;
  loading = this.productoService.loading;

  ngOnInit(){
    this.productoService.getProductosDestacados();
  }

  openProductDetail(product: Product): void {
    console.log(product);
    // Abrir modal
  }
}
