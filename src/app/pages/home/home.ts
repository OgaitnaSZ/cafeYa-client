import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Destacados } from '../../layout/components/destacados/destacados';
import { Info } from '../../layout/components/info/info';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Destacados, Info],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  openMenu = false;

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }
}
