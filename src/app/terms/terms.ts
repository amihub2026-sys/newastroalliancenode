import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terms.html',
  styleUrls: ['./terms.scss']
})
export class Terms {
  app = inject(LanguageService);

  translations = {
    en: {
      badge: 'ASTRO ALLIANCE',
      title: 'Terms & Conditions',
      subtitle:
        'Please read these terms carefully before using our matrimony services.',

      highlightTitle: 'Important Marriage Update',
      highlightText:
        'We kindly request all registered members to inform us immediately once their marriage is completed. If not informed, the horoscope/profile may remain active on the platform, which can cause inconvenience, wasted time, and mental stress for others searching for a bride or groom.',

      sections: [
        {
          title: 'Registration',
          content:
            'Users must provide true, correct, and complete information during registration. Fake, misleading, or duplicate profiles are not allowed.'
        },
        {
          title: 'Profile Responsibility',
          content:
            'Each user is fully responsible for the information, photos, and details shared in their profile. ASTRO ALLIANCE is not responsible for incorrect information submitted by users.'
        },
        {
          title: 'Privacy',
          content:
            'User information will be handled with care and stored securely. Personal details will not be intentionally shared without valid reason or user consent.'
        },
        {
          title: 'Subscription & Payment',
          content:
            'Certain features may require a paid subscription. Payments made for subscription plans or profile unlock services are non-refundable unless otherwise stated.'
        },
        {
          title: 'Acceptable Use',
          content:
            'Users must use the platform only for genuine matrimonial purposes. Misuse, harassment, abusive language, fake enquiries, or inappropriate behaviour is strictly prohibited.'
        },
        {
          title: 'Content Rules',
          content:
            'Uploading offensive, vulgar, misleading, or irrelevant photos and content is not allowed. The platform has the right to remove such content without prior notice.'
        },
        {
          title: 'Communication',
          content:
            'Users are expected to communicate respectfully with other members. Any personal discussions or decisions made between users are their own responsibility.'
        },
        {
          title: 'Account Removal',
          content:
            'ASTRO ALLIANCE reserves the right to suspend or remove any account that violates platform rules, provides false information, or creates issues for other users.'
        },
        {
          title: 'Marriage Status Update',
          content:
            'Once marriage is completed, users must inform us so that the horoscope/profile can be removed from the platform immediately.'
        },
        {
          title: 'Consent',
          content:
            'By registering on or using ASTRO ALLIANCE, you confirm that you have read, understood, and agreed to these Terms & Conditions.'
        }
      ],

      backText: 'Back to Register'
    },

    ta: {
      badge: 'ஆஸ்ட்ரோ அலையன்ஸ் மேட்ரிமோனி',
      title: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
      subtitle:
        'எங்கள் மேட்ரிமோனி சேவையை பயன்படுத்துவதற்கு முன் கீழே உள்ள விதிமுறைகளை கவனமாக படிக்கவும்.',

      highlightTitle: 'முக்கிய திருமண தகவல் குறிப்பு',
      highlightText:
        'எங்களிடம் பதிவு செய்தவர்கள் திருமணம் முடிந்தவுடன் உடனே எங்களுக்கு தகவல் தெரிவிக்க வேண்டும். தகவல் தெரிவிக்காமல் இருந்தால், ஜாதகம் / சுயவிவரம் தளத்தில் நீக்கப்படாமல் தொடரலாம். இதனால் மற்ற வரன் தேடும் நபர்களுக்கு காலவிரயமும் மன உளைச்சலும் ஏற்படலாம்.',

      sections: [
        {
          title: 'பதிவு',
          content:
            'பதிவு செய்யும் போது உண்மையான, சரியான மற்றும் முழுமையான தகவல்களை வழங்க வேண்டும். போலியான, தவறான அல்லது இரட்டை சுயவிவரங்கள் அனுமதிக்கப்படமாட்டாது.'
        },
        {
          title: 'சுயவிவர பொறுப்பு',
          content:
            'பயனர் தமது சுயவிவரத்தில் பதிவு செய்யும் தகவல்கள், புகைப்படங்கள் மற்றும் விவரங்களுக்கு அவரே முழுப் பொறுப்பு. பயனர் வழங்கும் தவறான தகவல்களுக்கு ஆஸ்ட்ரோ அலையன்ஸ் மேட்ரிமோனி பொறுப்பல்ல.'
        },
        {
          title: 'தனியுரிமை',
          content:
            'பயனர் தகவல்கள் பாதுகாப்பாக கையாளப்படும். தேவையற்ற வகையில் அல்லது பயனர் அனுமதி இல்லாமல் தனிப்பட்ட தகவல்கள் பகிரப்படமாட்டாது.'
        },
        {
          title: 'சந்தா மற்றும் கட்டணம்',
          content:
            'சில வசதிகளை பயன்படுத்த கட்டண சந்தா அவசியமாக இருக்கலாம். சந்தா திட்டங்கள் அல்லது சுயவிவர திறப்பு சேவைகளுக்காக செலுத்தப்பட்ட கட்டணம் பொதுவாக திரும்ப வழங்கப்படாது.'
        },
        {
          title: 'சரியான பயன்படுத்தல்',
          content:
            'இந்த தளம் உண்மையான திருமண நோக்கத்திற்காக மட்டுமே பயன்படுத்தப்பட வேண்டும். தவறான பயன்படுத்தல், தொந்தரவு, மோசமான வார்த்தைகள், போலியான விசாரணைகள் ஆகியவை தடைசெய்யப்படுகின்றன.'
        },
        {
          title: 'உள்ளடக்க விதிகள்',
          content:
            'அருவருப்பான, தவறான, பொருத்தமற்ற அல்லது தொடர்பில்லாத புகைப்படங்கள் மற்றும் உள்ளடக்கங்களை பதிவேற்றக் கூடாது. அவை முன்னறிவிப்பு இன்றி நீக்கப்படலாம்.'
        },
        {
          title: 'தொடர்பு',
          content:
            'பிற உறுப்பினர்களுடன் மரியாதையுடன் பேச வேண்டும். பயனர்களுக்குள் நடைபெறும் தனிப்பட்ட உரையாடல்கள் மற்றும் முடிவுகள் அவர்களது சொந்த பொறுப்பாகும்.'
        },
        {
          title: 'கணக்கு நீக்கம்',
          content:
            'விதிமுறைகளை மீறுவது, தவறான தகவல் வழங்குவது அல்லது பிற பயனர்களுக்கு பிரச்சினை ஏற்படுத்துவது போன்ற காரணங்களுக்காக கணக்கு நீக்கப்படலாம்.'
        },
        {
          title: 'திருமணம் முடிந்த தகவல்',
          content:
            'திருமணம் முடிந்தவுடன் தயவுசெய்து எங்களுக்கு தகவல் தெரிவிக்கவும். அதனால் ஜாதகம் / சுயவிவரம் தளத்தில் இருந்து உடனே நீக்கப்படும்.'
        },
        {
          title: 'ஒப்புதல்',
          content:
            'ஆஸ்ட்ரோ அலையன்ஸ்மேட்ரிமோனியில் பதிவு செய்வதன் மூலமும், சேவையை பயன்படுத்துவதன் மூலமும், மேற்கண்ட விதிமுறைகள் மற்றும் நிபந்தனைகளை நீங்கள் ஏற்றுக்கொண்டதாக கருதப்படும்.'
        }
      ],

      backText: 'பதிவு பக்கத்துக்கு திரும்பவும்'
    }
  };

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }
}