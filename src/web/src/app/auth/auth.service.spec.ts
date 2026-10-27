import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthenticatedUser, AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the signed-in user from the protected session endpoint', () => {
    const user = { id: 'user-id', email: 'cliente@example.com', roles: ['Cliente'] };
    const response: { user: AuthenticatedUser | null } = { user: null };

    service.getCurrentUser().subscribe((currentUser) => (response.user = currentUser));
    http.expectOne('/api/me').flush(user);

    expect(response.user).toEqual(user);
    expect(service.currentUser()).toEqual(user);
  });

  it('clears the current user when the session is not authenticated', () => {
    let response: unknown = 'pending';

    service.getCurrentUser().subscribe((currentUser) => (response = currentUser));
    http.expectOne('/api/me').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(response).toBeNull();
    expect(service.currentUser()).toBeNull();
  });
});
