import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import AOS from 'aos';

bootstrapApplication(App, appConfig)
  .then(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 120
    });
  })
  .catch((err) => console.error(err));