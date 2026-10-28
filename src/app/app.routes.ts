import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { CanActivateChildFn } from '@angular/router';
export const routes: Routes = [
  { path: 'connection-error', loadComponent: () => import('./connection-error/connection-error').then(m => m.ConnectionError) },
  { path: 'approval-pending', canActivate: [authGuard], loadComponent: () => import('./account-status/account-status').then(m => m.AccountStatus) },
  { path: 'profile-rejected', canActivate: [authGuard], loadComponent: () => import('./account-status/account-status').then(m => m.AccountStatus) },
  { path: '', loadComponent: () => import('./home/home').then(m => m.Home) },
  { path: 'free-search', loadComponent: () => import('./free-search/free-search').then(m => m.FreeSearch) },
  { path: 'free-profile/:code', loadComponent: () => import('./public-profile/public-profile').then(m => m.PublicProfilePreview) },
  { path: 'dashboard', canActivate:[authGuard], loadComponent:()=>import('./member-dashboard/member-dashboard').then(m=>m.MemberDashboard) },
  { path: 'registration-submitted', loadComponent: () => import('./registration-submitted/registration-submitted').then(m => m.RegistrationSubmitted) },

  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.Register) },
{
  // Approved member match discovery uses the same modern public card/filter UI,
  // but restricts results to the configured opposite gender.
  path: 'profiles',
  canActivate: [authGuard],
  data: { memberMode: true },
  loadComponent: () => import('./free-search/free-search').then(m => m.FreeSearch)
},
{
  // Keep the legacy activity tabs available without showing old search by default.
  path: 'profile-activity',
  loadComponent: () => import('./profiles/profiles').then(m => m.Profiles),
  canActivate: [authGuard]
},

{
  path: 'plans',
  loadComponent: () => import('./plans/plans').then(m => m.Plans),
  canActivate: [authGuard]
},

{
  path: 'biodata',
  loadComponent: () => import('./biodata/biodata').then(m => m.Biodata),
  canActivate: [authGuard]
},

{
  path: 'profile-view',
  loadComponent: () => import('./profile-view/profile-view').then(m => m.ProfileView),
  canActivate: [authGuard]
},

{
  path: 'my-biodata',
  loadComponent: () => import('./my-biodata/my-biodata').then(m => m.MyBiodataComponent),
  canActivate: [authGuard]
},

// Legacy success URL must not imply that a membership has been activated.
{ path: 'plan-success', redirectTo: 'plans', pathMatch: 'full' },
// Retire the old payment form URL until Razorpay is actually integrated.
{ path: 'payment', redirectTo: 'plans', pathMatch: 'full' },

{
  path: 'terms',
  loadComponent: () => import('./terms/terms').then(m => m.Terms)
},
{
  path: 'privacy-policy',
  loadComponent: () => import('./privacy-policy/privacy-policy').then(m => m.PrivacyPolicy)
},
{
  path: 'contact-us',
  loadComponent: () => import('./contact-us/contact-us').then(m => m.ContactUs)
},
{
  path: 'horoscope-match',
  loadComponent: () =>
    import('./horoscope-match/horoscope-match')
      .then(m => m.HoroscopeMatch)
},
{
  path: 'birth-chart',
  loadComponent: () =>
    import('./birth-chart/birth-chart')
      .then(m => m.BirthChart)
},
{
  path: 'received-interests',
  loadComponent: () => import('./received-interests/received-interests').then(m => m.ReceivedInterests),
  canActivate: [authGuard]
},

{
  path: 'sent-interests',
  loadComponent: () => import('./sent-interests/sent-interests').then(m => m.SentInterests),
  canActivate: [authGuard]
},
{
  path: 'admin-login',
  loadComponent: () =>
    import('./admin-login/admin-login').then(m => m.AdminLogin)
},
{
  path: 'admin',
  canActivate: [adminGuard],
  canActivateChild: [adminGuard],
  loadComponent: () => import('./admin/admin').then(m => m.Admin),
  children: [
    { path: 'profile-import', loadComponent: () => import('./admin/profile-import/profile-import').then(m => m.ProfileImport) },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./admin/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
      path: 'profiles',
      loadComponent: () =>
        import('./admin/profiles/profiles').then(m => m.Profiles)
    },
    {
      path: 'plans',
      loadComponent: () =>
        import('./admin/plans/plans').then(m => m.Plans)
    },
    {
      path: 'subscriptions',
      loadComponent: () =>
        import('./admin/subscriptions/subscriptions').then(m => m.Subscriptions)
    },
    {
  path: 'user-plans',
  loadComponent: () =>
    import('./admin/user-plans/user-plans').then(m => m.UserPlans)
},
    {
      path: 'payments',
      loadComponent: () =>
        import('./admin/payments/payments').then(m => m.Payments)
    },
    {
      path: 'settings',
      loadComponent: () =>
        import('./admin/settings/settings').then(m => m.Settings)
    },

{
  path: 'caste-list',
  loadComponent: () =>
    import('./admin/caste-list/caste-list').then(m => m.CasteList)
},
{
  path: 'castes/:id/profiles',
  loadComponent: () =>
    import('./admin/caste-profile-list/caste-profile-list')
      .then(m => m.CasteProfileList)
},
{
  path: 'religion-list',
  loadComponent: () =>
    import('./admin/religion-list/religion-list')
      .then(m => m.ReligionList)
},
{
  path: 'marital-status-list',
  loadComponent: () =>
    import('./admin/marital-status-list/marital-status-list')
      .then(m => m.MaritalStatusList)
},
{
  path: 'color',
  loadComponent: () =>
    import('./admin/masters/colors/colors').then(m => m.Colors)
},
{
  path: 'kudumba-nilai',
  loadComponent: () =>
    import('./admin/masters/kudumba-nilai/kudumba-nilai')
      .then(m => m.KudumbaNilai)
},
{
  path: 'second-marriage-reasons',
  loadComponent: () =>
    import('./admin/second-marriage-reasons/second-marriage-reasons')
      .then(m => m.SecondMarriageReasons)
},
{
  path: 'gender-list',
  loadComponent: () =>
    import('./admin/gender-list/gender-list')
      .then(m => m.GenderList)
},
{
  path: 'rasi-list',
  loadComponent: () =>
    import('./admin/rasi-list/rasi-list').then(m => m.RasiList)
},
{
  path: 'lagnam-list',
  loadComponent: () =>
    import('./admin/lagnam-list/lagnam-list').then(m => m.LagnamList)
},
{
  path: 'nakshatra-list',
  loadComponent: () =>
    import('./admin/nakshatra-list/nakshatra-list').then(m => m.NakshatraList)
},
{
  path: 'thisai-iruppu-list',
  loadComponent: () =>
    import('./admin/thisai-iruppu-list/thisai-iruppu-list')
      .then(m => m.ThisaiIruppuList)
},
{
  path: 'dhosham-list',
  loadComponent: () =>
    import('./admin/dhosham-list/dhosham-list').then(m => m.DhoshamList)
},
{
  path: 'country-list',
  loadComponent: () =>
    import('./admin/country-list/country-list').then(m => m.CountryList)
},
{
  path: 'state-list',
  loadComponent: () =>
    import('./admin/state-list/state-list').then(m => m.StateList)
},
{
  path: 'cities',
  loadComponent: () =>
    import('./admin/cities/cities')
      .then(m => m.Cities)
},
{
  path: 'profile-views',
  loadComponent: () =>
    import('./admin/profile-views/profile-views')
      .then(m => m.ProfileViews)
},

{
  path: 'interests',
  loadComponent: () =>
    import('./admin/interests/interests')
      .then(m => m.Interests)
},
{
  path: 'shortlists',
  loadComponent: () =>
    import('./admin/shortlists/shortlists')
      .then(m => m.Shortlists)
},
{
  path: 'likes-history',
  loadComponent: () =>
    import('./admin/likes-history/likes-history')
      .then(m => m.LikesHistory)
},
{
  path: 'admin-users',
  loadComponent: () =>
    import('./admin/admin-users/admin-users')
      .then(m => m.AdminUsers)
},
{
  path: 'create-biodata',
  loadComponent: () => import('./biodata/biodata').then(m => m.Biodata)
},

    {
  path: 'profile/:id',
  loadComponent: () =>
    import('./admin/profile-details/profile-details')
      .then(m => m.ProfileDetails)
},
  ]
  
},

{
  path: 'generateReportwithoutaddress/:type/:code',
  canActivate: [adminGuard],
  loadComponent: () =>
    import('./admin/profile-print/profile-print')
      .then(m => m.ProfilePrint)
},
  { path: '**', redirectTo: '' }
];