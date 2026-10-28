const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const imageCss = fs.readFileSync(path.join(root, 'src/app/biodata/biodata-wizard-backgrounds.scss'), 'utf8');
const template = fs.readFileSync(path.join(root, 'src/app/biodata/biodata.html'), 'utf8');
const component = fs.readFileSync(path.join(root, 'src/app/biodata/biodata.ts'), 'utf8');
const steps = fs.readFileSync(path.join(root, 'src/app/biodata/biodata.steps.ts'), 'utf8');
assert.match(template, /class="wizard-couple-banner" \[attr\.data-step\]="activeStep \+ 1"/);
assert.match(template, /\*ngIf="!isAdminBiodataMode\(\)"/);
assert.match(component, /biodata-wizard-backgrounds\.scss/);
assert.match(imageCss, /\.user-biodata-wizard/);
assert.equal((steps.match(/\{ id:/g) || []).length, 8, 'Wizard must still have eight steps');
for (let i=1; i<=8; i++) {
  const key = String(i).padStart(2, '0');
  const target = path.join(root, 'src/assets/biodata-wizard', `step-${key}.webp`);
  assert.ok(fs.statSync(target).size > 10000, `Empty/missing asset ${key}`);
  assert.equal(fs.readFileSync(target).subarray(8,12).toString('ascii'), 'WEBP', `Invalid WebP ${key}`);
  assert.ok(imageCss.includes(`data-step='${i}'`), `Missing SCSS selector for step ${i}`);
  assert.ok(imageCss.includes(`/assets/biodata-wizard/step-${key}.webp`), `Missing CSS link to image ${key}`);
}
console.log('PASS: all 8 optimized photos exist and map to the 8 user wizard steps');
console.log('PASS: admin mode retains original layout');
console.log('PASS: image styles remain user-wizard-scoped');
