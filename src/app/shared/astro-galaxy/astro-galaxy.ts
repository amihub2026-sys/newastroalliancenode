
import {
  Component,
  HostListener,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-astro-galaxy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './astro-galaxy.html',
  styleUrls: [
    './astro-galaxy.scss',
    './astro-galaxy.responsive.scss'
  ]
})
export class AstroGalaxy {

  private readonly router = inject(Router);

  isOpen = false;
  showSpeech = true;

  // Hide astrologer and dialogue on Login page only.
  get isLoginPage(): boolean {
    return this.router.url.split(/[?#]/)[0] === '/login';
  }

  readonly zodiacTicks = Array.from(
    { length: 12 },
    (_, index) => index
  );

  readonly planets = [
    {
      name: 'Mercury',
      angle: 0,
      color: '#b9a69a',
      radius: 2.8
    },
    {
      name: 'Venus',
      angle: 40,
      color: '#e6b46c',
      radius: 4.1
    },
    {
      name: 'Earth',
      angle: 80,
      color: '#3189d4',
      radius: 4.5
    },
    {
      name: 'Mars',
      angle: 120,
      color: '#cb6044',
      radius: 3.5
    },
    {
      name: 'Jupiter',
      angle: 160,
      color: '#d6a276',
      radius: 6
    },
    {
      name: 'Saturn',
      angle: 200,
      color: '#d1b27d',
      radius: 5
    },
    {
      name: 'Uranus',
      angle: 240,
      color: '#8dd7dd',
      radius: 4.1
    },
    {
      name: 'Neptune',
      angle: 280,
      color: '#4163cf',
      radius: 4.1
    },
    {
      name: 'Pluto',
      angle: 320,
      color: '#bca596',
      radius: 2.6
    }
  ];

  toggleGalaxy(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.showSpeech = false;
    }
  }

  closeGalaxy(): void {
    this.isOpen = false;
  }

  closeSpeech(): void {
    this.showSpeech = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeGalaxy();
  }
}
