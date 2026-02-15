import { Component, output, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-bottom-sheet',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.css',
})
export class BottomSheet {
  // INPUTS
  isOpen = input<boolean>(false);
  showCloseButton = input<boolean>(true);
  maxHeight = input<string>('85vh');

  // OUTPUTS
  close = output<void>();

  // STATE INTERNO
  private startY = signal(0);
  private currentY = signal(0);
  private isDragging = signal(false);
  translateY = signal(0);
  isClosing = signal(false);

  // Icons
  readonly X = X;

  constructor() {
    // Controlar overflow del body cuando el modal está abierto
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    });
  }

  closeModal(): void {
    this.isClosing.set(true);
    
    setTimeout(() => {
      this.isClosing.set(false);
      this.translateY.set(0);
      this.close.emit();
    }, 250);
  }

  onBackdropClick(): void {
    this.closeModal();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  // GESTOS TÁCTILES PARA ARRASTRAR Y CERRAR
  onTouchStart(event: TouchEvent): void {
    const sheet = event.currentTarget as HTMLElement;
    const isScrollable = sheet.scrollHeight > sheet.clientHeight;
    const isAtTop = sheet.scrollTop === 0;

    // Solo permitir arrastrar si está en el tope del scroll
    if (!isScrollable || isAtTop) {
      this.isDragging.set(true);
      this.startY.set(event.touches[0].clientY);
      this.currentY.set(event.touches[0].clientY);
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging()) return;

    this.currentY.set(event.touches[0].clientY);
    const deltaY = this.currentY() - this.startY();

    // Solo permitir arrastrar hacia abajo
    if (deltaY > 0) {
      this.translateY.set(deltaY);
    }
  }

  onTouchEnd(): void {
    if (!this.isDragging()) return;

    const deltaY = this.currentY() - this.startY();
    
    // Si arrastró más de 100px, cerrar el modal
    if (deltaY > 100) {
      this.closeModal();
    } else {
      // Volver a la posición original
      this.translateY.set(0);
    }

    this.isDragging.set(false);
    this.startY.set(0);
    this.currentY.set(0);
  }
}
