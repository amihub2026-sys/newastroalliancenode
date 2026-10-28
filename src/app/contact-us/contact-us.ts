import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.scss']
})
export class ContactUs {

  app = inject(LanguageService);

  translations = {

    en: {
      badge: 'ASTRO ALLIANCE',
      title: 'Contact Us',
      subtitle:
        'We are here to help you with your Astro Alliance matrimony journey.',

      phoneTitle: 'Call Us',
      phoneText: 'For support and enquiries',
      phone: '+91 90421 11424',

      emailTitle: 'Email Us',
      emailText: 'Send us your questions or support requests',
      email: 'astroalliance7@gmail.com',

      locationTitle: 'Our Location',
      locationText: 'Astro Alliance Matrimony',
      location: 'Madurai, Tamil Nadu',

      supportTitle: 'How Can We Help You?',

      supportItems: [
        'Account registration and login issues',
        'Profile creation and profile updates',
        'Matrimonial profile related queries',
        'Horoscope and matching related queries',
        'Subscription and payment related queries',
        'Technical support',
        'Privacy related questions',
        'Account and personal data deletion requests'
      ],

      privacyText: 'Privacy Policy',
      termsText: 'Terms & Conditions',
      backText: 'Back to Home'
    },

    ta: {
      badge: 'ஆஸ்ட்ரோ அலையன்ஸ் மேட்ரிமோனி',
      title: 'தொடர்பு கொள்ள',
      subtitle:
        'உங்கள் ஆஸ்ட்ரோ அலையன்ஸ் மேட்ரிமோனி பயணத்தில் உங்களுக்கு உதவ நாங்கள் தயாராக இருக்கிறோம்.',

      phoneTitle: 'எங்களை அழைக்கவும்',
      phoneText: 'உதவி மற்றும் விசாரணைகளுக்கு',
      phone: '+91 90421 11424',

      emailTitle: 'மின்னஞ்சல்',
      emailText: 'உங்கள் கேள்விகள் மற்றும் உதவி கோரிக்கைகளை அனுப்பவும்',
      email: 'astroalliance7@gmail.com',

      locationTitle: 'எங்கள் இருப்பிடம்',
      locationText: 'ஆஸ்ட்ரோ அலையன்ஸ் மேட்ரிமோனி',
      location: 'மதுரை, தமிழ்நாடு',

      supportTitle: 'நாங்கள் எவ்வாறு உதவலாம்?',

      supportItems: [
        'கணக்கு பதிவு மற்றும் உள்நுழைவு பிரச்சினைகள்',
        'சுயவிவரம் உருவாக்குதல் மற்றும் புதுப்பித்தல்',
        'திருமண சுயவிவரம் தொடர்பான கேள்விகள்',
        'ஜாதகம் மற்றும் பொருத்தம் தொடர்பான கேள்விகள்',
        'சந்தா மற்றும் கட்டணம் தொடர்பான கேள்விகள்',
        'தொழில்நுட்ப உதவி',
        'பிரைவசி தொடர்பான கேள்விகள்',
        'கணக்கு மற்றும் தனிப்பட்ட தகவல் நீக்க கோரிக்கைகள்'
      ],

      privacyText: 'பிரைவசி பாலிசி',
      termsText: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
      backText: 'ஹோம் பக்கத்திற்கு திரும்பவும்'
    }

  };

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }
}