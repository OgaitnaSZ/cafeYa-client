import { Component, effect, inject } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
 // Servicios
  private router = inject(Router);
  public auth = inject(Auth);
  private fb = inject(FormBuilder);

  // Signals
  user = this.auth.user;
  success = this.auth.successUser;
  loading = this.auth.loadingUser;
  error = this.auth.errorUser;

  // Campos del formulario
  formLogin = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.email]],
    telefono: ['', [Validators.pattern(/^\d{10}$/)]]
  });

  constructor() {
    effect(() => {
      if (this.auth.successUser()) {
        this.router.navigate(['menu']);
        this.auth.resetSuccess('user');
      }
    });
  }

  onLogin() {
    if (this.formLogin.invalid) return this.error.set('Faltan datos.');
    this.loading.set(true);
    const { nombre, email, telefono } = this.formLogin.getRawValue(); 
    this.auth.login(nombre, email, telefono);
    this.loading.set(false);
  }
}
