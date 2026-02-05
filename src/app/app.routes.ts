import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Validate } from './pages/validate/validate';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'validate', component: Validate },
    { path: '**', redirectTo: '' }
];