import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Validate } from './pages/validate/validate';
import { Menu } from './pages/menu/menu';
import { authGuard } from './auth.guard';
import { Login } from './pages/login/login';
import { noAuthGuard } from './noAuth.guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'validate/:id', component: Validate },
    { path: 'validate', component: Validate },
    { path: 'login', component: Login, canActivate: [noAuthGuard] },
    { path: 'menu', component: Menu, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];