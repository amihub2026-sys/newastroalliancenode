
import {
  Directive,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[appProfilePrivacy]',
  standalone: true
})
export class ProfilePrivacyDirective {

  @HostListener('contextmenu', ['$event'])
  preventRightClick(event: MouseEvent): void {
    event.preventDefault();
  }

  @HostListener('dragstart', ['$event'])
  preventDrag(event: DragEvent): void {
    event.preventDefault();
  }

  @HostListener('copy', ['$event'])
  preventCopy(event: ClipboardEvent): void {
    event.preventDefault();
  }

  @HostListener('cut', ['$event'])
  preventCut(event: ClipboardEvent): void {
    event.preventDefault();
  }
}
