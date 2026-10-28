import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Shown only when the server cannot confirm approval, without logging out a valid session. */
@Component({
  selector: 'app-member-connection-error',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="connection-state" role="main">
      <section aria-labelledby="connection-title">
        <span class="symbol" aria-hidden="true">⌛</span>
        <h1 id="connection-title">Connection is taking too long</h1>
        <p>We couldn't confirm your membership status right now. Please check that the Astro Alliance backend is running and try again. Your login and Biodata have not been removed.</p>
        <div class="actions">
          <button type="button" (click)="retry()">Try Again</button>
          <a routerLink="/my-biodata">My Biodata</a>
          <a routerLink="/free-search">Free Search</a>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .connection-state{min-height:70vh;display:grid;place-items:center;padding:24px;background:#faf7f9}
    section{max-width:540px;padding:36px;background:white;border:1px solid #f0dce5;border-radius:18px;text-align:center;box-shadow:0 12px 35px #5c21321c}
    .symbol{font-size:2.2rem}h1{color:#642e48;font-size:1.7rem}p{color:#635967;line-height:1.7}
    .actions{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px}
    .actions a,.actions button{background:#7c284d;color:white;padding:12px 16px;border-radius:9px;font:inherit;border:0;text-decoration:none;cursor:pointer}
    .actions a{background:#f8e7ee;color:#76294c}
  `]
})
export class ConnectionError {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  retry(): void {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
    const destination = requested.startsWith('/') && !requested.startsWith('//')
      && requested !== '/connection-error' ? requested : '/dashboard';
    void this.router.navigateByUrl(destination);
  }
}
