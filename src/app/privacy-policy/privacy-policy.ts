import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.scss']
})
export class PrivacyPolicy {

  app = inject(LanguageService);

  translations = {
    en: {
      badge: 'ASTRO ALLIANCE',
      title: 'Privacy Policy',
      subtitle:
        'This Privacy Policy explains how Astro Alliance collects, uses, stores and protects your personal information.',

      sections: [
        {
          title: 'Information We Collect',
          content:
            'We may collect information such as your name, gender, date of birth, birth time, birth place, mobile number, email address, profile photo, address, religion, caste or community, marital status, education, occupation, income, height, family details, horoscope details, Rasi, Amsam, Nakshatra, Paatham and partner preferences.'
        },
        {
          title: 'How We Use Your Information',
          content:
            'Your information may be used to create and manage your account, display matrimonial profiles, provide profile search and matching services, provide horoscope-related features, manage login and subscriptions, provide customer support, prevent misuse and improve platform security.'
        },
        {
          title: 'Profile Visibility',
          content:
            'Information added to your matrimonial profile may be visible to other registered or authorized users according to the access permissions and features available on Astro Alliance.'
        },
        {
          title: 'Profile Photographs',
          content:
            'Profile photographs uploaded by users may be displayed as part of the matrimonial profile and may be visible to authorized users according to the platform access rules.'
        },
        {
          title: 'Horoscope Information',
          content:
            'Astro Alliance may collect date of birth, time of birth, place of birth, Rasi, Amsam, Nakshatra, Paatham and related horoscope information for matrimonial and compatibility-related features.'
        },
        {
          title: 'Subscription & Payment',
          content:
            'Certain features may require a paid subscription. When payment facilities are enabled, payments may be processed through an authorized payment provider or applicable app-store billing system.'
        },
        {
          title: 'Sharing of Information',
          content:
            'Astro Alliance does not sell users personal information. Information may be shared with authorized users, hosting or database providers, payment providers, technical service providers, or legal authorities where necessary.'
        },
        {
          title: 'Data Security',
          content:
            'We take reasonable measures to protect personal information from unauthorized access, alteration, disclosure, loss or misuse. However, no internet-based system can guarantee complete security.'
        },
        {
          title: 'Data Retention',
          content:
            'Personal information may be retained while your account remains active and for as long as reasonably necessary to provide services, meet legal requirements, prevent fraud and maintain security.'
        },
        {
          title: 'Account & Data Deletion',
          content:
            'Users may request deletion of their Astro Alliance account and associated personal information using the Delete Account feature in the application or through our Contact Us page.'
        },
        {
          title: 'User Responsibility',
          content:
            'Users are responsible for ensuring that information provided in their profile is accurate and should only share personal information they are comfortable making available through the matrimonial service.'
        },
        {
          title: "Children's Privacy",
          content:
            'Astro Alliance is intended for adults eligible to use matrimonial services and is not intended for children to create matrimonial profiles.'
        },
        {
          title: 'Third-Party Services',
          content:
            'Astro Alliance may use third-party services for hosting, database storage, image storage, authentication, notifications, analytics, payments, security and monitoring.'
        },
        {
          title: 'Application Permissions',
          content:
            'Certain features may require device permissions, such as permission to select or upload profile photographs. Such permissions are used only for the relevant application functionality.'
        },
        {
          title: 'Changes to Privacy Policy',
          content:
            'This Privacy Policy may be updated when our services, features, data practices or legal requirements change.'
        },
        {
          title: 'Contact Us',
          content:
            'For privacy-related questions, account issues, corrections or account and data deletion requests, please contact us through our Contact Us page.'
        }
      ],

      backText: 'Back'
    },

    ta: {
      badge: 'ஆஸ்ட்ரோ அலையன்ஸ் மேட்ரிமோனி',
      title: 'பிரைவசி பாலிசி',
      subtitle:
        'ஆஸ்ட்ரோ அலையன்ஸ் உங்கள் தனிப்பட்ட தகவல்களை எவ்வாறு சேகரிக்கிறது, பயன்படுத்துகிறது, சேமிக்கிறது மற்றும் பாதுகாக்கிறது என்பதை இந்த பிரைவசி பாலிசி விளக்குகிறது.',

      sections: [
        {
          title: 'நாங்கள் சேகரிக்கும் தகவல்கள்',
          content:
            'பெயர், பாலினம், பிறந்த தேதி, பிறந்த நேரம், பிறந்த இடம், மொபைல் எண், மின்னஞ்சல் முகவரி, சுயவிவரப் புகைப்படம், முகவரி, மதம், சாதி அல்லது சமூக விவரங்கள், திருமண நிலை, கல்வி, தொழில், வருமானம், உயரம், குடும்ப விவரங்கள், ஜாதக விவரங்கள், ராசி, அம்சம், நட்சத்திரம், பாதம் மற்றும் வாழ்க்கைத் துணை விருப்பங்கள் போன்ற தகவல்களை நாங்கள் சேகரிக்கலாம்.'
        },
        {
          title: 'தகவல்களை எவ்வாறு பயன்படுத்துகிறோம்',
          content:
            'பயனர் கணக்கை உருவாக்கவும் நிர்வகிக்கவும், திருமண சுயவிவரங்களை காண்பிக்கவும், சுயவிவர தேடல் மற்றும் பொருத்த சேவைகளை வழங்கவும், ஜாதக தொடர்பான வசதிகளை வழங்கவும், உள்நுழைவு மற்றும் சந்தாவை நிர்வகிக்கவும், வாடிக்கையாளர் ஆதரவை வழங்கவும், தவறான பயன்பாட்டைத் தடுக்கவும் மற்றும் செயலியின் பாதுகாப்பை மேம்படுத்தவும் தகவல்கள் பயன்படுத்தப்படலாம்.'
        },
        {
          title: 'சுயவிவர தகவல்களின் பார்வை',
          content:
            'திருமண சுயவிவரத்தில் சேர்க்கப்படும் தகவல்கள், Astro Alliance-ன் அணுகல் அனுமதிகள் மற்றும் வசதிகளின் அடிப்படையில் மற்ற பதிவு செய்யப்பட்ட அல்லது அங்கீகரிக்கப்பட்ட பயனர்களுக்கு காண்பிக்கப்படலாம்.'
        },
        {
          title: 'சுயவிவரப் புகைப்படங்கள்',
          content:
            'பயனர்கள் பதிவேற்றும் சுயவிவரப் புகைப்படங்கள் திருமண சுயவிவரத்தின் ஒரு பகுதியாக காண்பிக்கப்படலாம் மற்றும் அணுகல் விதிமுறைகளின் அடிப்படையில் அங்கீகரிக்கப்பட்ட பயனர்களுக்கு தெரியலாம்.'
        },
        {
          title: 'ஜாதக தகவல்கள்',
          content:
            'பிறந்த தேதி, பிறந்த நேரம், பிறந்த இடம், ராசி, அம்சம், நட்சத்திரம், பாதம் மற்றும் பிற ஜாதக தகவல்கள் திருமண மற்றும் பொருத்தம் தொடர்பான வசதிகளுக்காக சேகரிக்கப்படலாம்.'
        },
        {
          title: 'சந்தா மற்றும் கட்டணம்',
          content:
            'சில வசதிகளை பயன்படுத்த கட்டண சந்தா தேவைப்படலாம். கட்டண வசதி செயல்படுத்தப்பட்டால், அங்கீகரிக்கப்பட்ட பேமெண்ட் சேவை அல்லது சம்பந்தப்பட்ட ஆப் ஸ்டோர் பில்லிங் முறையின் மூலம் பணம் செலுத்தப்படலாம்.'
        },
        {
          title: 'தகவல் பகிர்வு',
          content:
            'Astro Alliance பயனர்களின் தனிப்பட்ட தகவல்களை விற்பனை செய்யாது. தேவையான சந்தர்ப்பங்களில் அங்கீகரிக்கப்பட்ட பயனர்கள், ஹோஸ்டிங் அல்லது டேட்டாபேஸ் நிறுவனங்கள், பேமெண்ட் சேவை நிறுவனங்கள், தொழில்நுட்ப சேவை நிறுவனங்கள் அல்லது சட்ட அதிகாரிகளுடன் தகவல்கள் பகிரப்படலாம்.'
        },
        {
          title: 'தகவல் பாதுகாப்பு',
          content:
            'தனிப்பட்ட தகவல்களை அனுமதியற்ற அணுகல், மாற்றம், வெளியீடு, இழப்பு அல்லது தவறான பயன்பாட்டிலிருந்து பாதுகாக்க நியாயமான பாதுகாப்பு நடவடிக்கைகளை மேற்கொள்கிறோம். இருப்பினும் எந்த இணைய சேவையும் 100% பாதுகாப்பை உறுதி செய்ய முடியாது.'
        },
        {
          title: 'தகவல் சேமிப்பு',
          content:
            'பயனர் கணக்கு செயல்பாட்டில் இருக்கும் காலத்திலும், சேவையை வழங்க தேவையான காலத்திலும் தகவல்கள் சேமிக்கப்படலாம். சட்டப்பூர்வ தேவைகள், மோசடி தடுப்பு மற்றும் பாதுகாப்பு காரணங்களுக்காக சில தகவல்கள் தேவையான காலத்திற்கு வைத்திருக்கப்படலாம்.'
        },
        {
          title: 'கணக்கு மற்றும் தகவல் நீக்கம்',
          content:
            'பயனர்கள் தங்கள் Astro Alliance கணக்கையும் அதனுடன் தொடர்புடைய தனிப்பட்ட தகவல்களையும் செயலியில் உள்ள Delete Account வசதி அல்லது Contact Us பக்கத்தின் மூலம் நீக்க கோரலாம்.'
        },
        {
          title: 'பயனரின் பொறுப்பு',
          content:
            'சுயவிவரத்தில் வழங்கப்படும் தகவல்கள் சரியானவை என்பதை உறுதிப்படுத்துவது பயனரின் பொறுப்பு. திருமண சேவையின் மூலம் பகிர விரும்பும் தகவல்களை மட்டுமே பயனர்கள் வழங்க வேண்டும்.'
        },
        {
          title: 'குழந்தைகளின் தனியுரிமை',
          content:
            'Astro Alliance திருமண சேவையை பயன்படுத்த தகுதியான பெரியவர்களுக்காக உருவாக்கப்பட்டுள்ளது. குழந்தைகள் திருமண சுயவிவரம் உருவாக்குவதற்காக இந்த சேவை வடிவமைக்கப்படவில்லை.'
        },
        {
          title: 'மூன்றாம் தரப்பு சேவைகள்',
          content:
            'ஹோஸ்டிங், டேட்டாபேஸ் சேமிப்பு, புகைப்பட சேமிப்பு, Authentication, Notifications, Analytics, Payment Processing, Security மற்றும் Monitoring போன்ற தேவைகளுக்காக Astro Alliance மூன்றாம் தரப்பு சேவைகளை பயன்படுத்தலாம்.'
        },
        {
          title: 'செயலி அனுமதிகள்',
          content:
            'சுயவிவரப் புகைப்படத்தை தேர்வு செய்ய அல்லது பதிவேற்றுவது போன்ற சில வசதிகளுக்கு மொபைல் சாதன அனுமதிகள் தேவைப்படலாம். அவை சம்பந்தப்பட்ட செயலி வசதிக்காக மட்டுமே பயன்படுத்தப்படும்.'
        },
        {
          title: 'பிரைவசி பாலிசியில் மாற்றங்கள்',
          content:
            'எங்கள் சேவைகள், செயலி வசதிகள், தகவல் பயன்பாட்டு நடைமுறைகள் அல்லது சட்ட விதிமுறைகள் மாறும்போது இந்த பிரைவசி பாலிசி புதுப்பிக்கப்படலாம்.'
        },
        {
          title: 'தொடர்புக்கு',
          content:
            'பிரைவசி தொடர்பான கேள்விகள், கணக்கு பிரச்சினைகள், தகவல் திருத்தம் அல்லது கணக்கு மற்றும் தகவல் நீக்கம் தொடர்பான கோரிக்கைகளுக்கு எங்கள் Contact Us பக்கத்தின் மூலம் தொடர்பு கொள்ளலாம்.'
        }
      ],

      backText: 'திரும்பவும்'
    }
  };

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }
}