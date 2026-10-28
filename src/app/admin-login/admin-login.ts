import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    const savedEmail = localStorage.getItem('admin_email');

    if (savedEmail) {
      this.email = savedEmail;
    }
  }

  onAdminLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Enter your administrator email and password.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.adminLogin({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (res: any) => {
                this.isLoading = false;

this.authService.saveAdminSession(res.data);

        this.ngZone.run(() => {
          this.router.navigateByUrl('/admin/dashboard');
        });
      },
      error: (err: any) => {

        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Unable to sign in. Check your credentials.';
      }
    });
  }
}