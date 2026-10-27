import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="auth-title">
        <p class="eyebrow">Sistema de Gestão de Locação de Veículos</p>
        <h1 id="auth-title">{{ registering() ? 'Criar conta' : 'Acesse sua conta' }}</h1>
        <p class="subheading">
          {{ registering() ? 'Cadastre-se para acessar o portal.' : 'Entre para continuar.' }}
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          @if (registering()) {
            <label for="fullName">Nome completo</label>
            <input id="fullName" type="text" formControlName="fullName" autocomplete="name" />
          }

          <label for="email">E-mail</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" required />

          <label for="password">Senha</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            [attr.autocomplete]="registering() ? 'new-password' : 'current-password'"
            required
          />

          @if (errorMessage()) {
            <p class="error" role="alert">{{ errorMessage() }}</p>
          }

          <button type="submit" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Aguarde…' : registering() ? 'Criar conta' : 'Entrar' }}
          </button>
        </form>

        <button class="link-button" type="button" (click)="toggleMode()">
          {{ registering() ? 'Já tenho uma conta' : 'Ainda não tenho uma conta' }}
        </button>
      </section>
    </main>
  `,
})
export class LoginComponent {
  readonly registering = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form: FormGroup = this.formBuilder.group({
    fullName: ['', [Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', [Validators.required, Validators.maxLength(100)]],
  });

  toggleMode(): void {
    this.registering.update((value) => !value);
    const fullName = this.form.controls['fullName'];
    fullName.setValidators(
      this.registering()
        ? [Validators.required, Validators.minLength(2), Validators.maxLength(200)]
        : [Validators.maxLength(200)],
    );
    fullName.updateValueAndValidity();
    this.errorMessage.set('');
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    const { fullName, email, password } = this.form.getRawValue();
    const request = this.registering()
      ? this.authService.register({
          fullName: fullName ?? '',
          email: email ?? '',
          password: password ?? '',
        })
      : this.authService.login(email ?? '', password ?? '');

    request.subscribe({
      next: (user) => {
        const destination = user.roles.includes('Cliente') ? '/portal' : '/admin';
        void this.router.navigate([destination]);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error));
        this.submitting.set(false);
      },
      complete: () => this.submitting.set(false),
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      return 'E-mail ou senha inválidos.';
    }

    const identityErrors =
      error instanceof HttpErrorResponse ? error.error?.errors?.identity : null;
    if (Array.isArray(identityErrors) && identityErrors.length > 0) {
      return identityErrors.join(' ');
    }

    return 'Não foi possível concluir a solicitação. Tente novamente.';
  }
}
