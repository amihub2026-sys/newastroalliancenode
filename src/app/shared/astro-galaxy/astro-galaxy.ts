
import {
  Component,
  HostListener
} from '@angular/core';

import { RouterLink } from '@angular/router';

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

  isOpen = false;

  readonly zodiacTicks = Array.from(
    { length: 12 },
    (_, index) => index
  );

  toggleGalaxy(): void {
    this.isOpen = !this.isOpen;
  }

  closeGalaxy(): void {
    this.isOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeGalaxy();
  }
}
