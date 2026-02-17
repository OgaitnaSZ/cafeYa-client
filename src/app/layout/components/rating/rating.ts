import { Component, effect, inject, input, output, signal } from '@angular/core';
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
import { BottomSheet } from '../bottom-sheet/bottom-sheet';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-rating',
  imports: [CommonModule, FormsModule, LucideAngularModule, BottomSheet],
  templateUrl: './rating.html',
  styleUrl: './rating.css',
})
export class Rating {
  // INPUTS
  pedido = input.required<PedidoData>();
  nombreCliente = input<string>('Cliente');
  isOpen = input<boolean>(true);
  
  // OUTPUTS
  ratingSubmitted = output<any>();
  close = output<void>();

  constructor() {
    effect(() => {
      if (this.pedido()) {
        this.resetRating();
      }
    });
  }
  // Sercvicios
  private calificacionService = inject(CalificacionService);
  private toastService = inject(ToastService);

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
      return this.toastService.error('Selecciona una puntuación');
    }
  
    if (!this.resena().trim()) {
      return this.toastService.error('Escribí un comentario');
    }
  
    const calificacionData = {
      pedido_id: this.pedido().pedido_id,
      puntuacion: this.puntuacion(),
      resena: this.resena().trim(),
      nombre_cliente: this.nombreCliente()
    };

    this.calificacionService.createCalificacion(calificacionData).subscribe({
      next: (calificacionResponse) => {
        this.ratingSubmitted.emit(calificacionResponse);
        this.toastService.success('Calificación enviada correctamente')
        // Cerrar el modal
        this.close.emit();
      },
      error: (err) => {
        return this.toastService.error('Error al enviar calificación');
      }
    });
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