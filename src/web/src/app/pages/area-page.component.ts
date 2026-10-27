import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-area-page',
  imports: [DatePipe, RouterLink],
  template: `
    <main class="workspace">
      <header class="workspace-header">
        <a class="brand" routerLink="/portal">SGLV</a>
        <button type="button" class="secondary-button" (click)="logout()">Sair</button>
      </header>
      <section class="workspace-content">
        <p class="eyebrow">Sistema de Gestão de Locação de Veículos</p>
        <h1>{{ title }}</h1>
        <p>Autenticado como {{ authService.currentUser()?.email }}.</p>
        <p>Horário local: {{ now | date: 'short' : 'America/Sao_Paulo' : 'pt-BR' }}</p>
        <p class="status" role="status">{{ message() }}</p>
      </section>
    </main>
  `,
})
export class AreaPageComponent implements OnInit {
  readonly now = new Date();
  readonly message = signal('Carregando…');
  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly title = this.route.snapshot.data['title'] as string;
  private readonly endpoint = this.route.snapshot.data['endpoint'] as string;

  ngOnInit(): void {
    this.http.get<{ message: string }>(this.endpoint).subscribe({
      next: (response) => this.message.set(response.message),
      error: () => this.message.set('Não foi possível carregar esta área.'),
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => void this.router.navigate(['/login']));
  }
}
