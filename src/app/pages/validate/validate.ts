import { Component, ViewChildren, QueryList, ElementRef, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { MesaService } from '../../core/services/mesa';

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
  public auth = inject(Auth);
  public mesaService = inject(MesaService);

  // Signals
  mesa = this.auth.getMesa;
  error = this.auth.errorMesa;
  loading = this.auth.loadingMesa;
  mesaDetails = this.mesaService.mesa;

  // Variables
  mesaId: string = '';
  code: string[] = ['', '', '', ''];
  invalidIdError: boolean = false;
  showHelpModal: boolean = false;

  constructor() {
    effect(() => {
      if (this.auth.successMesa()) {
        this.router.navigate(['login']);
        this.auth.resetSuccess('mesa');
      }
    });
  }

  ngOnInit(): void {
    this.auth.mesa.set(null);
    this.auth.logoutMesa();
    this.mesaId = this.route.snapshot.params['id'];

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && this.isUUID(id)) {
        this.invalidIdError = false;
        this.mesaId = id;

        // Opcional: Obtener detalles de la mesa para mostrar en el modal de ayuda
        this.mesaService.getMesa(id);
      } else {
        this.error.set('ID de mesa inválido. Vuelve a scanear el código QR.');
        this.invalidIdError = true;
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
  
    // Asignar a la posición correcta (nextIndex - 1)
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
    
    this.loading.set(true);
    this.error.set('');
    
    const fullCode = this.code.join('');
  
    this.auth.authMesa({ mesa_id: this.mesaId, codigo: fullCode });
    this.loading.set(false);
  }

  clearCode(): void {
    this.code = ['', '', '', ''];
    const inputs = this.digitInputs.toArray();
    inputs[0]?.nativeElement.focus();
  }

  // Utils
  private isUUID(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

}