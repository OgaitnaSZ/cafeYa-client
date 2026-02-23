import { Component, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronLeft } from 'lucide-angular';

export interface BadgeConfig {
  text: string;
  color?: 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'yellow' | 'gray';
  pulse?: boolean;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  title = input.required<string>();
  backLink = input<string>();
  badge = input<BadgeConfig>();
  
  ChevronLeft = ChevronLeft;
}
