import { Routes } from '@angular/router';
import { roleGuard } from './auth/role.guard';
import { AreaPageComponent } from './pages/area-page.component';
import { LoginComponent } from './pages/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'portal',
    component: AreaPageComponent,
    canActivate: [roleGuard],
    data: { title: 'Portal do cliente', endpoint: '/api/portal', roles: ['Cliente'] },
  },
  {
    path: 'admin',
    component: AreaPageComponent,
    canActivate: [roleGuard],
    data: {
      title: 'Administração',
      endpoint: '/api/admin',
      roles: ['Atendente', 'Operador', 'Administrador'],
    },
  },
  { path: '', pathMatch: 'full', redirectTo: 'portal' },
  { path: '**', redirectTo: 'portal' },
];
