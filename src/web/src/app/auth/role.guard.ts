import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[];

  return authService.getCurrentUser().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      return requiredRoles.some((role) => user.roles.includes(role))
        ? true
        : router.createUrlTree(['/portal']);
    }),
  );
};
