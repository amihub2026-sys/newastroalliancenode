/**
 * Astro Alliance — conservative SCSS cascade clean-up.
 *
 * Remove declarations only when a later declaration has the SAME complete
 * selector / ancestor / at-rule context and an equal-or-higher cascade priority.
 * This deliberately does not try to merge distinct selectors, change breakpoints,
 * or blanket-remove !important. Run visual regression tests before shipping.
 *
 * Usage: node scripts/clean-styles.cjs          (write changes)
 *        node scripts/clean-styles.cjs --check  (report work left; no writes)
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const sourceRoot = path.resolve(__dirname, '../src');
const readOnly = process.argv.includes('--check');
// Public user UI cleanup only; preserve the Admin Panel source exactly.
const userOnly = !process.argv.includes('--include-admin');
const counts = {
  scannedFiles: 0, updatedFiles: 0, supersededDeclarations: 0,
  redundantImportant: 0, emptyRules: 0, mergedAdjacentRules: 0,
  formattedComponents: 0,
};

function walkFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(name);
    else if (/\.s?css$/i.test(name)) cleanFile(name);
  }
}

function locationKey(decl) {
  if (decl.parent.type !== 'rule') return null;
  if (decl.prop.startsWith('--')) return null;
  const ancestors = [];
  let node = decl.parent;
  while (node && node.type !== 'root') {
    if (node.type === 'rule') {
      ancestors.unshift(`selector:${node.selector.trim().replace(/\s+/g, ' ')}`);
    } else if (node.type === 'atrule') {
      // Keyframe steps, font faces and animation declarations are special cases.
      if (/keyframes|font-face|page|property/i.test(node.name)) return null;
      ancestors.unshift(`@${node.name}:${node.params.trim().replace(/\s+/g, ' ')}`);
    }
    node = node.parent;
  }
  return `${ancestors.join(' | ')} | property:${decl.prop.toLowerCase()}`;
}

const FALLBACK_PROPS = new Set([
  'display', 'position', 'background', 'background-image', 'appearance',
  'user-select', 'filter', 'backdrop-filter',
]);
function isPotentialFallback(a, b) {
  const property = a.prop.toLowerCase();
  if (FALLBACK_PROPS.has(property) && a.value !== b.value) return true;
  if (property.startsWith('-')) return true;
  if (/-webkit-|-moz-|-ms-|-o-/i.test(a.value) ||
      /-webkit-|-moz-|-ms-|-o-/i.test(b.value)) return true;
  return false;
}

// Only needed for the two new components previously saved as minified 1-line SCSS.
function formatComponent(ast) {
  function setSpace(container, depth) {
    if (!container.nodes) return;
    for (const node of container.nodes) {
      node.raws.before = `\n${'  '.repeat(depth)}`;
      if (node.type === 'rule') {
        node.raws.between = ' ';
        node.raws.semicolon = true;
        setSpace(node, depth + 1);
      } else if (node.type === 'atrule') {
        node.raws.between = node.nodes ? ' ' : '';
        if (node.nodes) {
          node.raws.semicolon = true;
          setSpace(node, depth + 1);
        }
      } else if (node.type === 'decl') {
        node.raws.between = ': ';
        if (node.important) node.raws.important = ' !important';
      }
    }
    container.raws.after = `\n${'  '.repeat(Math.max(0, depth - 1))}`;
  }
  setSpace(ast, 0);
  ast.raws.after = '\n';
  if (ast.nodes[0]) ast.nodes[0].raws.before = '';
}

function cleanFile(filePath) {
  if (userOnly && path.relative(sourceRoot, filePath).replace(/\\/g, '/').startsWith('app/admin/')) return;
  counts.scannedFiles++;
  const original = fs.readFileSync(filePath, 'utf8');
  const root = postcss.parse(original, { from: filePath });
  const groups = new Map();
  root.walkDecls(decl => {
    const key = locationKey(decl);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(decl);
  });

  for (const declarations of groups.values()) {
    for (let i = 0; i < declarations.length - 1; i++) {
      const previous = declarations[i];
      let winner;
      // The later rule must have identical selector/conditional context and
      // must beat or match the prior declaration's importance.
      for (let j = i + 1; j < declarations.length; j++) {
        const candidate = declarations[j];
        if (candidate.parent === previous.parent) continue; // keep in-rule fallbacks
        if (previous.important && !candidate.important) continue;
        if (isPotentialFallback(previous, candidate)) continue;
        winner = candidate;
      }
      if (!winner) continue;
      counts.supersededDeclarations++;
      if (previous.important) counts.redundantImportant++;
      previous.remove();
    }
  }

  // Discard rule blocks made completely empty by safe declaration deletion.
  root.walkRules(rule => {
    if (!rule.nodes || rule.nodes.some(node => node.type !== 'comment')) return;
    if (rule.nodes.length) {
      for (const comment of [...rule.nodes]) {
        comment.remove();
        rule.before(comment);
      }
    }
    rule.remove();
    counts.emptyRules++;
  });

  // Merge only immediately adjacent identical selectors in the same scope.
  root.walkRules(rule => {
    const prev = rule.prev();
    if (!prev || prev.type !== 'rule' || prev.selector !== rule.selector) return;
    if (!prev.nodes.every(n => n.type === 'decl' || n.type === 'comment')) return;
    if (!rule.nodes.every(n => n.type === 'decl' || n.type === 'comment')) return;
    for (const node of [...rule.nodes]) prev.append(node);
    rule.remove();
    counts.mergedAdjacentRules++;
  });

  const relative = path.relative(sourceRoot, filePath).replace(/\\/g, '/');
  if (relative === 'app/home/home.scss' || relative === 'app/admin/admin.scss') {
    formatComponent(root);
    counts.formattedComponents++;
  }

  const newText = root.toString();
  if (newText !== original) {
    counts.updatedFiles++;
    if (!readOnly) fs.writeFileSync(filePath, newText);
    // Verify the transformed source remains parseable.
    postcss.parse(newText, { from: filePath });
  }
}
walkFiles(sourceRoot);
console.log(JSON.stringify({ checkOnly: readOnly, ...counts }, null, 2));
if (readOnly && counts.supersededDeclarations) process.exitCode = 1;
