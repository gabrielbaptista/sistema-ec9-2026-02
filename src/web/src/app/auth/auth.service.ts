import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, of, tap } from 'rxjs';

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}

export interface RegistrationRequest {
  fullName: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthenticatedUser | null>(null);
  private readonly http = inject(HttpClient);

  getCurrentUser(): Observable<AuthenticatedUser | null> {
    return this.http.get<AuthenticatedUser>('/api/me').pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }

  login(email: string, password: string): Observable<AuthenticatedUser> {
    return this.http
      .post<AuthenticatedUser>('/api/auth/login', { email, password })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  register(request: RegistrationRequest): Observable<AuthenticatedUser> {
    return this.http
      .post<AuthenticatedUser>('/api/auth/register', request)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      catchError(() => of(void 0)),
      finalize(() => this.currentUser.set(null)),
    );
  }
}
