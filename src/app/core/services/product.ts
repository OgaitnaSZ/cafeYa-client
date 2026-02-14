import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, forkJoin, of, tap } from 'rxjs';
import { Categoria, Product } from '../interfaces/product';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}producto/`;

  // Inject
  private http = inject(HttpClient);

  // Signals de estado
  productos = signal<Product[]>([]);
  todasLasCategorias = signal<Categoria[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  categoriasEnUso = computed(() => {
    const productos = this.productos();
    const categorias = this.todasLasCategorias();
    
    // IDs de categorías que tienen productos
    const categoriasIdsEnUso = new Set(
      productos.map(p => p.categoria_id)
    );
    
    // Filtrar categorias
    return categorias
      .filter(cat => categoriasIdsEnUso.has(cat.categoria_id))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);
    
    forkJoin({
      productos: this.http.get<Product[]>(`${this.apiUrl}productos`),
      categorias: this.http.get<Categoria[]>(`${this.apiUrl}categorias`)
    }).pipe(
      tap(({ productos, categorias }) => {
        const categoriaMap = new Map<number, Categoria>(
          categorias.map(cat => [cat.categoria_id, cat])
        );
        
        //Asignar emoji a cada producto basándose en su categoria_id
        const productosConEmoji = productos.map(producto => ({
          ...producto,
          emoji: categoriaMap.get(producto.categoria_id)?.emoji || '🍽️'
        }));
        
        this.productos.set(productosConEmoji);
        this.todasLasCategorias.set(categorias);
      }),
      catchError(err => {
        this.error.set('Error al cargar los datos');
        console.error(err);
        return of({ productos: [], categorias: [] });
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  // Helper para obtener categoría por ID
  getCategoriaById(id: number): Categoria | undefined {
    return this.todasLasCategorias().find(cat => cat.categoria_id === id);
  }
}
