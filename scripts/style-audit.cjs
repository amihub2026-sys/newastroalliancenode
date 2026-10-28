/** Print SCSS technical-debt counts without changing any source files. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const source = path.resolve(__dirname, '../src');
const data = [];
function visit(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) visit(file);
    else if (/\.s?css$/i.test(file)) {
      const root = postcss.parse(fs.readFileSync(file, 'utf8'), { from: file });
      let declarations = 0, important = 0, rules = 0;
      root.walkRules(() => rules++);
      root.walkDecls(node => { declarations++; if (node.important) important++; });
      data.push({ file: path.relative(source, file), rules, declarations, important });
    }
  }
}
visit(source);
data.sort((a, b) => b.important - a.important);
console.table(data.filter(item => item.important));
const total = data.reduce((out, row) => {
  out.files++;
  out.rules += row.rules;
  out.declarations += row.declarations;
  out.important += row.important;
  return out;
}, { files: 0, rules: 0, declarations: 0, important: 0 });
console.log(`SCSS audit: ${JSON.stringify(total)}`);
