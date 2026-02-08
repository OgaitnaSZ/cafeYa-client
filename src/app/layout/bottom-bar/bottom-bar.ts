import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-bottom-bar',
  imports: [RouterLink],
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.css',
})
export class BottomBar {
  // Servicios
  public auth = inject(Auth);
}
