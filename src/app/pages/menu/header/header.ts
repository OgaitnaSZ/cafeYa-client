import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public cartService = inject(CartService);

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly ShoppingCart = ShoppingCart;
}
