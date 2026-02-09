import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public cartService = inject(CartService);
}
