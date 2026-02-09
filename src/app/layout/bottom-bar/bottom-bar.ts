import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-bottom-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.css',
})
export class BottomBar {
  // Servicios
  public auth = inject(Auth);
  public cartService = inject(CartService);
}
