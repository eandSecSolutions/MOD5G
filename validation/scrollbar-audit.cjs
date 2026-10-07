/* Static audit only: no browser, server, screenshots, or layout simulation.
   Run from the workspace root: node qa-v36/scrollbar-audit.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const CSSOM = require('rrweb-cssom');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
const document = dom.window.document;
const hrefs = [...document.querySelectorAll('link[rel=stylesheet]')].map(el => el.getAttribute('href'));
assert.equal(hrefs.at(-1), 'styles/scrollbars.css', 'Scrollbar overrides must load after slide styles.');

function flatten(rules, context = []) {
  return [...rules].flatMap(rule => rule.cssRules
    ? flatten(rule.cssRules, [...context, rule.conditionText || rule.media?.mediaText || ''])
    : [{ rule, context }]);
}
const sheets = hrefs.map(href => ({ href, rules: flatten(CSSOM.parse(fs.readFileSync(path.join(root, href), 'utf8')).cssRules) }));
const theme = sheets.find(s => s.href === 'styles/scrollbars.css').rules;
const elementRules = theme.filter(({ rule }) => rule.selectorText && !rule.selectorText.includes('::-webkit-'));
const partRules = theme.filter(({ rule }) => rule.selectorText?.includes('::-webkit-'));
const normal = elementRules.find(({ rule, context }) => !context.length && rule.style['scrollbar-width'] === 'thin').rule;
const webkitReset = elementRules.find(({ rule, context }) => context.includes('selector(::-webkit-scrollbar)') && rule.style['scrollbar-width'] === 'auto').rule;
const forcedReset = elementRules.find(({ rule, context }) => context.includes('(forced-colors: active)') && rule.style['scrollbar-width'] === 'auto').rule;
assert.equal(webkitReset.style['scrollbar-color'], 'auto');
assert.equal(forcedReset.style['scrollbar-color'], 'auto');
assert.ok(partRules.every(({ context }) => context.includes('(forced-colors: none)')), 'Custom parts must not apply in forced colors.');

// Independently discover scroll surfaces from every loaded production stylesheet.
const surfaces = new Map();
for (const sheet of sheets.filter(s => s.href !== 'styles/scrollbars.css')) {
  for (const { rule } of sheet.rules) {
    if (!rule.selectorText) continue;
    if (!['overflow', 'overflow-x', 'overflow-y'].some(prop => /^(auto|scroll)$/.test(rule.style[prop] || ''))) continue;
    for (const selector of rule.selectorText.split(',').map(s => s.trim())) {
      if (selector === '.slide-rail') continue;
      assert.match(selector, /^(?:dialog|(?:\.[\w-]+)+)$/, `Audit fixture needed for ${selector}`);
      surfaces.set(selector, sheet.href);
    }
  }
}
// The PIP is created dynamically; it must be covered even before runtime creation.
surfaces.set('.impl-pip-scroll', 'scripts/implementation.js');
for (const [selector, source] of surfaces) {
  const el = document.createElement(selector === 'dialog' ? 'dialog' : 'div');
  if (selector !== 'dialog') el.className = selector.slice(1).split('.').join(' ');
  document.body.append(el);
  for (const rule of [normal, webkitReset, forcedReset]) {
    assert.ok(el.matches(rule.selectorText), `${selector} from ${source} lacks a scrollbar branch.`);
  }
  for (const { rule } of partRules) {
    assert.ok(el.matches(rule.selectorText.split('::-webkit-')[0]), `${selector} lacks a custom scrollbar part.`);
  }
  el.remove();
}

// New element declarations cannot hide content or change scroll/keyboard/touch behavior.
for (const { rule } of elementRules) {
  for (const prop of [...Array(rule.style.length)].map((_, i) => rule.style[i])) {
    assert.ok(prop.startsWith('--mod-scroll-') || ['scrollbar-width', 'scrollbar-color'].includes(prop), `Unexpected element property: ${prop}`);
  }
}
const rail = document.createElement('nav');
rail.className = 'slide-rail';
document.body.append(rail);
assert.ok(!rail.matches(normal.selectorText), 'The intentionally hidden navigation rail must stay excluded.');
assert.ok(!rail.matches(webkitReset.selectorText));
assert.ok(!rail.matches(forcedReset.selectorText));
for (const { rule } of partRules) assert.ok(!rail.matches(rule.selectorText.split('::-webkit-')[0]));
const shell = fs.readFileSync(path.join(root, 'styles/shell.css'), 'utf8');
assert.match(shell, /\.slide-rail\s*\{[^}]*scrollbar-width:none/);
assert.match(shell, /\.slide-rail::-webkit-scrollbar\s*\{display:none\}/);

const lum = hex => hex.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
const palettes = elementRules.filter(({ rule }) => rule.style['--mod-scroll-track']).map(({ rule }) => {
  const track = lum(rule.style['--mod-scroll-track']);
  const contrast = {};
  for (const prop of ['--mod-scroll-thumb', '--mod-scroll-thumb-hover', '--mod-scroll-thumb-active']) {
    const thumb = lum(rule.style[prop]);
    const ratio = (Math.max(track, thumb) + .05) / (Math.min(track, thumb) + .05);
    assert.ok(ratio >= 3, `${rule.selectorText} ${prop} contrast is below 3:1.`);
    contrast[prop] = Number(ratio.toFixed(2));
  }
  return { theme: rule.selectorText, contrast };
});
console.log(JSON.stringify({
  result: 'PASS — static CSS/source audit',
  stylesheetsParsed: sheets.length,
  coveredSelectors: [...surfaces.keys()],
  palettes,
  limitations: 'No browser or visual scrollbar verification was performed. This audit does not measure rendering, platform scrollbar appearance, layout, or real keyboard/touch interactions.'
}, null, 2));
