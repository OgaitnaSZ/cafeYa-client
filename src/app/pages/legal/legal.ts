import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Info } from '../../layout/components/info/info';
import { ChevronLeft, Headset, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-legal',
  imports: [CommonModule, Info, RouterLink, LucideAngularModule],
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
