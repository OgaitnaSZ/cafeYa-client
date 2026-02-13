import { Component, effect, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalificacionService } from '../../../core/services/calificacion';
import { PedidoService } from '../../../core/services/pedido';
import { Auth } from '../../../core/services/auth';
import { PedidoData } from '../../../core/interfaces/pedido.model';

@Component({
  selector: 'app-rating',
  imports: [CommonModule, FormsModule],
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

  constructor(private calificacionService: CalificacionService) {
    effect(() => {
      if (this.pedido) {
        this.resetRating();
      }
    });
  }

  // Rating
  puntuacion = signal(0);
  puntuacionHover = signal(0);
  resena = signal('');
  
  // Estados
  isSubmitting = signal(false);
  showSuccess = signal(false);

  private resetRating(): void {
    this.puntuacion.set(0);
    this.puntuacionHover.set(0);
    this.resena.set('');
    this.showSuccess.set(false);
    this.isSubmitting.set(false);
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
      alert('Por favor, seleccioná una puntuación');
      return;
    }

    if (!this.resena().trim()) {
      alert('Por favor, escribí un comentario');
      return;
    }

    this.isSubmitting.set(true);

    const calificacionData = {
      pedido_id: this.pedido.pedido_id,
      puntuacion: this.puntuacion(),
      resena: this.resena().trim(),
      nombre_cliente: this.nombreCliente
    };

    this.calificacionService.createCalificacion(calificacionData).subscribe({
      next: (response) => {
        console.log('⭐ Calificación creada:', response);
        
        // Mostrar éxito
        this.showSuccess.set(true);
        
        // Vibración
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        // Emitir evento al padre con la calificación
        this.ratingSubmitted.emit(response);
        
        // Cerrar después de 2 segundos
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error:', error);
        alert('Error al enviar calificación. Intentá nuevamente.');
        this.isSubmitting.set(false);
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
}