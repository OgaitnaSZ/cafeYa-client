import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, Categoria } from '../../core/interfaces/product';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product';
import { CartService } from '../../core/services/cart';
import { Header } from '../../layout/components/header/header';
import { ProductsListList } from './products-list-list/products-list-list';
import { ProductDetails } from './product-details/product-details';
import { ProductsListGrid } from './products-list-grid/products-list-grid';
import { LucideAngularModule, Search, Funnel, ArrowDownWideNarrow, List, LayoutGrid, Check } from 'lucide-angular';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, FormsModule, Header, ProductsListList, ProductsListGrid, ProductDetails, LucideAngularModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  // Servicios
  public productoService = inject(ProductService);
  public cartService = inject(CartService);
  private toastService = inject(ToastService);

  // Signals de UI
  viewMode = signal<'list' | 'grid'>('grid');
  searchQuery = signal('');
  showFilters = signal(false);
  showSort = signal(false);
  selectedCategoriasIds = signal<number[]>([]);
  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);
  sortBy = signal('nombre-asc');
  
  // Modal
  selectedProduct = signal<Product | null>(null);
  
  // Carrito 
  cartItemCount = computed(() => this.cartService.itemCount());

  // COMPUTED: Productos filtrados y ordenados
  filteredProducts = computed(() => {
    let results = [...this.productoService.productos()];

    // Filtro por búsqueda
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      results = results.filter(p => 
        p.nombre.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query)
      );
    }

    // Filtro por categoría
    const categoriaIds = this.selectedCategoriasIds();
    if (categoriaIds.length > 0) {
      results = results.filter(p => categoriaIds.includes(p.categoria_id));
    }

    // Filtro por precio
    const min = this.precioMin();
    const max = this.precioMax();
    if (min !== null) {
      results = results.filter(p => p.precio_unitario >= min);
    }
    if (max !== null) {
      results = results.filter(p => p.precio_unitario <= max);
    }

    // Ordenamiento
    return this.sortProducts(results, this.sortBy());
  });

  // COMPUTED: Contar filtros activos
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedCategoriasIds().length > 0) count++;
    if (this.precioMin() !== null || this.precioMax() !== null) count++;
    return count;
  });

  // Opciones de ordenamiento
  sortOptions = [
    { value: 'nombre-asc', label: 'Nombre: A-Z' },
    { value: 'nombre-desc', label: 'Nombre: Z-A' },
    { value: 'precio-asc', label: 'Precio: Menor a mayor' },
    { value: 'precio-desc', label: 'Precio: Mayor a menor' }
  ];

  // MÉTODOS DE COMUNICACIÓN CON COMPONENTES HIJOS
  handleProductClick(product: Product): void {
    this.openProductDetail(product);
  }

  handleAddToCart(product: Product): void {
    if (!product.disponibilidad) return this.toastService.error('No hay disponibilidad',`${product.nombre}`);

    this.cartService.addToCart(product, 1, '');
    
    // Feedback visual
    this.toastService.success('Añadido al carrito',`${product.nombre}`)
  }

  // Modal
  openProductDetail(product: Product): void {
    this.selectedProduct.set(product);
    document.body.style.overflow = 'hidden';
  }

  ngOnInit(): void {
    this.productoService.cargarDatos();
  }

  // BÚSQUEDA Y FILTROS
  toggleFilters(): void {
    this.showFilters.update(v => !v);
    if (this.showFilters()) {
      this.showSort.set(false);
    }
  }

  toggleSort(): void {
    this.showSort.update(v => !v);
    if (this.showSort()) {
      this.showFilters.set(false);
    }
  }

  toggleCategoria(categoriaId: number): void {
    this.selectedCategoriasIds.update(ids => {
      const index = ids.indexOf(categoriaId);
      if (index > -1) {
        return ids.filter(id => id !== categoriaId);
      } else {
        return [...ids, categoriaId];
      }
    });
  }

  isCategoriaSelected(categoriaId: number): boolean {
    return this.selectedCategoriasIds().includes(categoriaId);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoriasIds.set([]);
    this.precioMin.set(null);
    this.precioMax.set(null);
  }

  // ORDENAMIENTO
  selectSort(sortValue: string): void {
    this.sortBy.set(sortValue);
    this.showSort.set(false);
  }

  private sortProducts(products: Product[], sortBy: string): Product[] {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'nombre-asc':
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre-desc':
        return sorted.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'precio-asc':
        return sorted.sort((a, b) => a.precio_unitario - b.precio_unitario);
      case 'precio-desc':
        return sorted.sort((a, b) => b.precio_unitario - a.precio_unitario);
      default:
        return sorted;
    }
  }

  // CARRITO
  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    
    if (!product.disponibilidad) return;

    this.cartService.addToCart(product);
  }

  // Helper para obtener categoría de un producto
  getCategoria(product: Product): Categoria | undefined {
    return this.productoService.todasLasCategorias()
      .find(cat => cat.categoria_id === product.categoria_id);
  }

  // Icons
  readonly Search = Search;
  readonly Funnel = Funnel;
  readonly ArrowDownWideNarrow = ArrowDownWideNarrow;
  readonly List = List;
  readonly LayoutGrid = LayoutGrid;
  readonly Check = Check;
}