import { Pipe, PipeTransform } from '@angular/core';
import { publicDisplayValue } from './public-value-dictionary';

@Pipe({ name: 'publicValue', standalone: true, pure: true })
export class PublicProfileValuePipe implements PipeTransform {
  transform(value: unknown, lang: 'en'|'ta' = 'en'): string {
    return publicDisplayValue(value, lang);
  }
}
