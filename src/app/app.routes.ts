import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Validate } from './pages/validate/validate';
import { Menu } from './pages/menu/menu';
import { authGuard } from './auth.guard';
import { Login } from './pages/login/login';
import { noAuthGuard } from './noAuth.guard';
import { Table } from './pages/table/table';
import { Orders } from './pages/orders/orders';
import { Cart } from './pages/cart/cart';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'validate/:id', component: Validate },
    { path: 'validate', component: Validate },
    { path: 'login', component: Login, canActivate: [noAuthGuard] },
    { path: 'menu', component: Menu, canActivate: [authGuard] },
    { path: 'table', component: Table, canActivate: [authGuard] },
    { path: 'orders', component: Orders, canActivate: [authGuard] },
    { path: 'cart', component: Cart, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];