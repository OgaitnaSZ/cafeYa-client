import { Component, effect, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalificacionService } from '../../../core/services/calificacion';
import { PedidoData } from '../../../core/interfaces/pedido.model';
import { 
  LucideAngularModule,
  Star,
  Check,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-rating',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './rating.html',
  styleUrl: './rating.css',
})
export class Rating {
  // INPUTS
  @Input({ required: true }) pedido!: PedidoData;
  @Input() nombreCliente: string = 'Cliente';

  // OUTPUTS
  @Output() close = new EventEmitter<void>();
  @Output() ratingSubmitted = new EventEmitter<any>();

  constructor() {
    effect(() => {
      if (this.pedido) {
        this.resetRating();
      }
    });
  }
  // Sercvicios
  private calificacionService = inject(CalificacionService);

  // Estados
  calificacion = this.calificacionService.calificacion;
  loading =  this.calificacionService.loading;
  success = this.calificacionService.success;
  error = this.calificacionService.error;

  // Rating
  resena = signal('');
  puntuacion = signal(0);
  puntuacionHover = signal(0);

  private resetRating(): void {
    this.calificacion.set(null)
    this.success.set(null);
    this.loading.set(false);
    this.error.set(null);
    this.puntuacion.set(0);
    this.puntuacionHover.set(0);
    this.resena.set('');
  }

  // MÉTODOS DE RATING
  setRating(rating: number): void {
    this.puntuacion.set(rating);
  }

  setHoverRating(rating: number): void {
    this.puntuacionHover.set(rating);
  }

  clearHoverRating(): void {
    this.puntuacionHover.set(0);
  }

  getRatingDisplay(): number {
    return this.puntuacionHover() || this.puntuacion();
  }

  // SUBMIT
  submitRating(): void {
    if (this.puntuacion() === 0) {
      this.error.set('Por favor, seleccioná una puntuación');
      return;
    }
  
    if (!this.resena().trim()) {
      this.error.set('Por favor, escribí un comentario');
      return;
    }
  
    this.loading.set(true);
  
    const calificacionData = {
      pedido_id: this.pedido.pedido_id,
      puntuacion: this.puntuacion(),
      resena: this.resena().trim(),
      nombre_cliente: this.nombreCliente
    };

    this.calificacionService.createCalificacion(calificacionData).subscribe({
      next: (calificacionResponse) => {
        this.ratingSubmitted.emit(calificacionResponse);
        
        // Cerrar el modal
        this.close.emit();
        
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al enviar la calificación');
        this.loading.set(false);
      }
    });
  }

  // Cerrar modal
  closeModal(): void {
    this.close.emit();
  }

  // Prevenir cierre al hacer click en el contenido
  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  // Icons
  readonly Star = Star;
  readonly Check = Check;
  readonly X = X;
}