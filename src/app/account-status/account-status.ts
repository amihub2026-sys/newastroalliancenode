import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({
  selector: 'app-account-status', standalone: true, imports: [RouterLink],
  template: `<main style="max-width:640px;margin:80px auto;padding:24px">
    <h1>{{ rejected ? 'Profile needs changes' : 'Profile awaiting approval' }}</h1>
    <p>{{ rejected ? 'Please review your profile details and contact support for the reason before resubmitting.' : 'Your profile has been submitted. Our team will review it before it becomes visible to members.' }}</p>
    @if (rejected) { <a routerLink="/biodata">Correct my Biodata</a> · }
    <a routerLink="/free-search">Free Search</a> · <a routerLink="/contact-us">Contact support</a>
  </main>`
})
export class AccountStatus {
  readonly rejected = inject(ActivatedRoute).snapshot.routeConfig?.path === 'profile-rejected';
}
