import { Component, signal } from '@angular/core';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { BottomBar } from './layout/bottom-bar/bottom-bar';
import { Router } from '@angular/router';
import { filter } from 'rxjs';
import { ToastContainer } from './layout/components/toast/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomBar, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  hideBottomBar = signal(false);
  activeSession: boolean = false;

  constructor(router: Router) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        
        const shouldHide = url.startsWith('/login') || url.startsWith('/validate');
        
        this.hideBottomBar.set(shouldHide);
      });
  }
}
