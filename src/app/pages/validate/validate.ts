import { Component, OnInit, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MesaService } from '../../core/services/mesa';
import { Mesa } from '../../core/interfaces/mesa.model';

@Component({
  selector: 'app-validate',
  imports: [],
  templateUrl: './validate.html',
  styleUrl: './validate.css',
})
export class Validate {
  @ViewChildren('digit1, digit2, digit3, digit4') digitInputs!: QueryList<ElementRef>;

  // Servicios
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public mesaService = inject(MesaService);

  // Signals
  mesa = this.mesaService.mesa;
  error = this.mesaService.error;

  // Variables
  mesaId: string = '';
  code: string[] = ['', '', '', ''];
  isValidating: boolean = false;
  showHelpModal: boolean = false;

  ngOnInit(): void {
    console.log('Validate component initialized');
    this.mesaService.mesa.set(null);
    this.mesaId = this.route.snapshot.params['id'];

    // Verificar que sea un numero y que exista en la BD
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.mesaId = id;
        this.mesaService.getMesa(this.mesaId);
      } else {
        this.error.set('ID de mesa inválido.');
      }
    });

    // Auto-focus en primer input
    setTimeout(() => {
      const inputs = this.digitInputs.toArray();
      if (inputs[0]) {
        inputs[0].nativeElement.focus();
      }
    }, 300);
  }

  onDigitInput(event: any, nextIndex: number): void {
    let value = event.target.value;
    
    // Permitir solo letras y números
    if (!/^[a-zA-Z0-9]*$/.test(value)) {
      event.target.value = '';
      return;
    }
  
    // Convertir a mayúsculas
    value = value.toUpperCase();
    event.target.value = value;
  
    // ✅ Asignar a la posición correcta (nextIndex - 1)
    this.code[nextIndex - 1] = value;
    
    // Mover al siguiente input si hay valor
    if (value && nextIndex < 4) {
      const inputs = this.digitInputs.toArray();
      inputs[nextIndex]?.nativeElement.focus();
    }
    
    // Limpiar error al escribir
    this.error.set('');
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    // Backspace: volver al input anterior si está vacío
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      const inputs = this.digitInputs.toArray();
      inputs[index - 1]?.nativeElement.focus();
    }
  }

  isCodeComplete(): boolean {
    return this.code.every(
      char =>
        typeof char === 'string' &&
        char.length === 1 &&
        /^[A-Z0-9]$/.test(char)
    );
  }

  async validateCode(): Promise<void> {
    if (!this.isCodeComplete()) return;
    
    this.isValidating = true;
    this.error.set('');
    
    const fullCode = this.code.join('');

    this.mesa.set({ mesa_id: this.mesaId, numero: this.mesa()?.numero || 0, codigo: fullCode });
  
    this.mesaService.validar(<Mesa>this.mesa())
  }

  clearCode(): void {
    this.code = ['', '', '', ''];
    const inputs = this.digitInputs.toArray();
    inputs[0]?.nativeElement.focus();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}