/** Fast source-level checks. Run the Angular build and browser tests separately. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const biodataRoot = path.join(root, 'src/app/biodata');
const get = relative => fs.readFileSync(path.join(root, relative), 'utf8');
function loadTs(relative) {
  const filename = path.join(root, relative);
  const result = ts.transpileModule(get(relative), { fileName: filename,
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022} });
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = module.paths;
  mod._compile(result.outputText, filename);
  return mod.exports;
}
const names = loadTs('src/app/biodata/biodata.names.ts');
const wizard = loadTs('src/app/biodata/biodata.steps.ts');
assert.equal(names.suggestBilingualName('தாமரை செல்வி').en, 'Thamarai Selvi');
assert.equal(names.suggestBilingualName('Thamarai Selvi').ta, 'தாமரை செல்வி');
assert.equal(names.suggestBilingualName('அருண் குமார்').en, 'Arun Kumar');
assert.equal(names.suggestBilingualName('Arun Kumar').ta, 'அருண் குமார்');
assert.equal(wizard.BIODATA_STEPS.length, 8);
assert.deepEqual(wizard.BIODATA_STEPS.map(x => x.id),
  ['personal','family','education','address','horoscope','preferences','photos','review']);
assert.equal(wizard.firstMissingStepField([{key:'name',value:''}]).key, 'name');
assert.equal(wizard.firstMissingStepField([{key:'name',value:'Thamarai'}]),undefined);
const page = get('src/app/biodata/biodata.html');
const component = get('src/app/biodata/biodata.ts');
const files = [
  'personal-details','family-details','education-career','location-details',
  'horoscope-details','partner-preferences','review-submit','profile-preview'
];
for (const section of files) {
  const local = `src/app/biodata/sections/${section}/${section}`;
  for (const extension of ['html','ts','scss']) {
    assert.ok(fs.existsSync(path.join(root,`${local}.${extension}`)), `Missing ${local}.${extension}`);
  }
  assert.ok(page.includes(`<app-biodata-${section} [vm]="this"></app-biodata-${section}>`),
    `Biodata parent does not render ${section}`);
  const html = get(`${local}.html`);
  assert.equal((html.match(/<details\b/g)||[]).length, (html.match(/<\/details>/g)||[]).length,
    `Unbalanced accordion: ${section}`);
  assert.ok(html.includes('vm.'), `Section not connected to shared state: ${section}`);
}
const personal = get('src/app/biodata/sections/personal-details/personal-details.html');
const family = get('src/app/biodata/sections/family-details/family-details.html');
assert.ok(personal.includes('else normalNameFields'));
assert.ok(family.includes('else normalParentFields'));
assert.ok(family.includes('onUserFamilyNameInput('));
assert.ok(component.includes('ProfilePreview'));
assert.ok(page.includes('activeStep > i ?'));
assert.ok(!page.includes('i<activeStep'));
assert.ok(get('src/app/biodata/sections/family-details/family-details.ts').includes('suggestBilingualName'));
console.log('PASS: Tamil/English name examples, eight steps and step validation');
console.log('PASS: eight extracted form/preview section components and bindings');
console.log('PASS: corrected NG5002 expression and retained admin-mode form sections');
