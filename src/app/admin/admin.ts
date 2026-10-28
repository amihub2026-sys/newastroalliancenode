import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../core/services/language.service';

interface AdminMenuItem { label: string; path: string; icon: string; ownerOnly?: boolean; }
interface AdminMenuGroup { title: string; items: AdminMenuItem[]; }

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  sidebarOpen = false;
  readonly groups: AdminMenuGroup[] = [
    { title: 'Overview', items: [{ label: 'Dashboard', path: '/admin/dashboard', icon: '▦' }] },
    { title: 'Members', items: [
      { label: 'Profiles', path: '/admin/profiles', icon: '♡' },
      { label: 'Create profile', path: '/admin/create-biodata', icon: '+' },
      { label: 'Bulk profile import', path: '/admin/profile-import', icon: '⇧' },
      { label: 'Profile views', path: '/admin/profile-views', icon: '◉' },
      { label: 'Interests', path: '/admin/interests', icon: '↗' },
      { label: 'Shortlists', path: '/admin/shortlists', icon: '☆' },
      { label: 'Likes history', path: '/admin/likes-history', icon: '♥' }
    ] },
    { title: 'Membership & billing', items: [
      { label: 'Plans', path: '/admin/plans', icon: '▤' },
      { label: 'User plans', path: '/admin/user-plans', icon: '◈' },
      { label: 'Subscriptions', path: '/admin/subscriptions', icon: '◷' },
      { label: 'Payments', path: '/admin/payments', icon: '₹' }
    ] },
    { title: 'Master data', items: [
      { label: 'Religion', path: '/admin/religion-list', icon: '◈' },
      { label: 'Caste', path: '/admin/caste-list', icon: '◇' },
      { label: 'Gender', path: '/admin/gender-list', icon: '◌' },
      { label: 'Marital status', path: '/admin/marital-status-list', icon: '◌' },
      { label: 'Country', path: '/admin/country-list', icon: '⌖' },
      { label: 'State', path: '/admin/state-list', icon: '⌖' },
      { label: 'Cities', path: '/admin/cities', icon: '⌖' },
      { label: 'Rasi', path: '/admin/rasi-list', icon: '☼' },
      { label: 'Nakshatra', path: '/admin/nakshatra-list', icon: '✧' },
      { label: 'Lagnam', path: '/admin/lagnam-list', icon: '✧' },
      { label: 'Dhosham', path: '/admin/dhosham-list', icon: '✧' },
      { label: 'Thisai iruppu', path: '/admin/thisai-iruppu-list', icon: '✧' },
      { label: 'Color', path: '/admin/color', icon: '◉' },
      { label: 'Kudumba nilai', path: '/admin/kudumba-nilai', icon: '⌂' },
      { label: 'Second marriage reasons', path: '/admin/second-marriage-reasons', icon: '◌' }
    ] },
    { title: 'Administration', items: [
      { label: 'Admin accounts', path: '/admin/admin-users', icon: '♙', ownerOnly: true },
      { label: 'Settings', path: '/admin/settings', icon: '⚙' }
    ] }
  ];

  get adminName(): string {
    return typeof window === 'undefined' ? 'Admin' : localStorage.getItem('admin_name') || 'Admin';
  }
  get isOwner(): boolean {
    return typeof window !== 'undefined' && localStorage.getItem('admin_role') === 'super_admin';
  }
  get currentLang(): 'en' | 'ta' { return this.language.currentLang; }
  changeLanguage(lang: 'en' | 'ta'): void { this.language.currentLang = lang; }
  closeSidebar(): void { this.sidebarOpen = false; }
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  logoutAdmin(): void { this.auth.adminLogout(); this.router.navigateByUrl('/admin-login'); }
}
