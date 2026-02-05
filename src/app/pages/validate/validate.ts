import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-validate',
  imports: [],
  templateUrl: './validate.html',
  styleUrl: './validate.css',
})
export class Validate {
  @ViewChildren('digit1, digit2, digit3, digit4') digitInputs!: QueryList<ElementRef>;
  
  mesaId: string = '';
  code: string[] = ['', '', '', ''];
  error: string = '';
  isValidating: boolean = false;
  showHelpModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.mesaId = this.route.snapshot.params['id'];

    // Verificar que sea un numero y que exista en la BD
    
    
    // Auto-focus en primer input
    setTimeout(() => {
      const inputs = this.digitInputs.toArray();
      if (inputs[0]) {
        inputs[0].nativeElement.focus();
      }
    }, 300);
  }

  onDigitInput(event: any, nextIndex: number): void {
    const value = event.target.value;
    
    // Solo permitir números
    if (!/^\d*$/.test(value)) {
      event.target.value = '';
      return;
    }
    
    // Mover al siguiente input si hay valor
    if (value && nextIndex <= 3) {
      const inputs = this.digitInputs.toArray();
      inputs[nextIndex]?.nativeElement.focus();
    }
    
    // Limpiar error al escribir
    this.error = '';
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    // Backspace: volver al input anterior si está vacío
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      const inputs = this.digitInputs.toArray();
      inputs[index - 1]?.nativeElement.focus();
    }
  }

  isCodeComplete(): boolean {
    return this.code.every(digit => digit !== '');
  }

  async validateCode(): Promise<void> {
    if (!this.isCodeComplete()) return;
    
    this.isValidating = true;
    this.error = '';
    
    const fullCode = this.code.join('');
    
    try {
      // Validar código con el backend
      // const result = await this.mesaService.validateMesa(this.mesaId, fullCode);
      
      // if (result.success) {
      //   // Guardar sesión
      //   localStorage.setItem('mesaSession', JSON.stringify({
      //     mesaId: this.mesaId,
      //     mesaNumber: this.mesaNumber,
      //     code: fullCode,
      //     timestamp: new Date().toISOString()
      //   }));
        
      //   // Redirigir al menú
      //   this.router.navigate(['/menu']);
      // } else {
      //   this.error = result.message || 'Código incorrecto. Intentá de nuevo.';
      //   this.clearCode();
      // }
    } catch (error) {
      this.error = 'Error al validar. Verificá tu conexión.';
      console.error('Validation error:', error);
    } finally {
      this.isValidating = false;
    }
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