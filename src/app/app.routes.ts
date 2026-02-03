import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Scan } from './pages/scan/scan';
import { Validate } from './pages/validate/validate';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'scan', component: Scan },
    { path: 'validate/:id', component: Validate },
    { path: '**', redirectTo: '' }
];