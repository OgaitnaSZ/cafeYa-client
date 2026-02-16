import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Info } from '../../layout/components/info/info';
import { ChevronLeft, Headset, LucideAngularModule } from 'lucide-angular';
import { Header } from '../../layout/components/header/header';

@Component({
  selector: 'app-legal',
  imports: [CommonModule, Info, LucideAngularModule, Header],
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class Legal {
  activeTab = signal<'privacidad' | 'terminos' | 'contacto'>('privacidad');
  today = new Date();

  router = inject(Router);

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly Headset = Headset;
}
