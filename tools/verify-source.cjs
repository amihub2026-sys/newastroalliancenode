/* Basic source-delivery checks without npm dependencies; NOT an Angular build. */
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
const source = (path) => readFileSync(join(__dirname, '..', path), 'utf8');
const routes = source('src/app/app.routes.ts');
const admin = source('src/app/admin/admin.ts');
const home = source('src/app/home/home.html');
const importPage = source('src/app/admin/profile-import/profile-import.ts');
for (const pathname of ['profiles','register','login','admin-login','profile-import','payments','admin-users']) {
  assert.match(routes, new RegExp(`path: ['"]${pathname}['"]`), `missing route ${pathname}`);
}
assert.match(admin, /Bulk profile import/);
assert.match(admin, /Payments/);
assert.match(home, /routerLink="\/register"/);
assert.match(home, /routerLink="\/free-search"/);
assert.match(importPage, /submit\(commit: boolean\)/);
assert.match(importPage, /canImport/);
for (const asset of ['caro-02.jpg','caro-06.jpg','caro-01.jpg','ring.jpg']) {
  assert.ok(existsSync(join(__dirname,'..','src/assets',asset)), `missing ${asset}`);
}
assert.ok(!existsSync(join(__dirname, '..', 'src/environments/supabase.ts')));
assert.match(source('src/environments/environment.prod.ts'), /https:\/\/astroalliance-backend\.onrender\.com\/api/);
console.log('PASS: route, module, homepage, import-contract, asset and configured API checks');

// Temporary success-gallery delivery checks; images and captions are replaceable.
const storyConfig = source('src/app/home/success-stories.data.ts');
const homeCopy = source('src/app/home/home.ts');
for (const n of ['01','02','03']) {
  const photo = `story-${n}.jpg`;
  assert.ok(existsSync(join(__dirname, '..', 'src/assets/success-stories',photo)), `missing photo ${photo}`);
  assert.ok(storyConfig.includes(photo), `unreferenced photo ${photo}`);
}
// The current homepage embeds the bilingual story copy directly in its template.
for (const phrase of ['Wedding inspiration','திருமணக் கொண்டாட்டங்கள்','Sample photo','மாதிரிப் புகைப்படம்']) {
  assert.ok(home.includes(phrase), `missing bilingual gallery label: ${phrase}`);
}
assert.match(home, /photo\.sample|astro-story-sample/);
assert.match(storyConfig, /NOT\s*\n?\s*\*?\s*verified Astro Alliance customer success stories/);
console.log('PASS: success-gallery assets, accurate disclosure, bilingual copy, Astro Match entry');
