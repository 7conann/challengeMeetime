import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/projection/routing/projection.routes').then(
        (m) => m.PROJECTION_ROUTES
      ),
  },
  { path: '**', redirectTo: '' },
];
