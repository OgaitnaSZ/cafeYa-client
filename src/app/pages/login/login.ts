import { Component, effect, inject } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Lock, AlertCircle, Phone, Mail, User } from 'lucide-angular';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-login',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
 // Servicios
  private router = inject(Router);
  public auth = inject(Auth);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  // Signals
  user = this.auth.user;
  success = this.auth.successUser;
  error = this.auth.errorUser;

  // Campos del formulario
  formLogin = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.email]],
    telefono: ['', [Validators.pattern(/^\d{10}$/)]],
    duracion_minutos: [30, [Validators.required]]
  });

  duracionOptions = [
    { value: 15, label: '15' },
    { value: 30, label: '30' },
    { value: 45, label: '45' },
    { value: 60, label: '60+' }
  ];

  constructor() {
    effect(() => {
      if (this.auth.successUser()) {
        this.router.navigate(['menu']);
        this.auth.resetSuccess('user');
        this.toastService.success('Inicio de sesion exitoso');
      }
    });
  }

  selectDuracion(value: number): void {
    this.formLogin.patchValue({ duracion_minutos: value });
  }

  onLogin() {
    if (this.formLogin.invalid) return this.toastService.error('Faltan datos','Completa los campos requeridos');
    const { nombre, email, telefono, duracion_minutos } = this.formLogin.getRawValue(); 
    this.auth.login(nombre, email, telefono, duracion_minutos);
  }

  // Icons
  readonly Lock = Lock;
  readonly AlertCircle = AlertCircle;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly User = User;
}
