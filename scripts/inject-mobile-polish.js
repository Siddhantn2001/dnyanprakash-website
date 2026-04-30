#!/usr/bin/env node
/*
 * Dev-only one-shot: inject the mobile-polish CSS link + JS script tag
 * into every .html file across the project. Idempotent — skips files
 * that already include the references. Computes a relative path from
 * each page back to /scripts/ based on its depth.
 *
 * Usage: node scripts/inject-mobile-polish.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS_FILE = 'mobile-polish.css';
const JS_FILE = 'mobile-polish.js';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'screenshots') continue;
      walk(p, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(p);
    }
  }
  return files;
}

function relScripts(filePath) {
  // Path from the html file's directory to the /scripts/ folder
  const fromDir = path.dirname(filePath);
  const target = path.join(ROOT, 'scripts');
  let rel = path.relative(fromDir, target);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.split(path.sep).join('/');
}

const files = walk(ROOT);
let changed = 0;
let skipped = 0;

for (const f of files) {
  const rel = relScripts(f);
  let html = fs.readFileSync(f, 'utf8');

  const cssTag = `<link rel="stylesheet" href="${rel}/${CSS_FILE}" />`;
  const jsTag = `<script defer src="${rel}/${JS_FILE}"></script>`;

  let didChange = false;

  // Inject CSS link before </head> if not present
  if (!html.includes(CSS_FILE)) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', `  <!-- Mobile polish layer (R/GA pass 2026-04-29) -->\n  ${cssTag}\n</head>`);
      didChange = true;
    }
  }

  // Inject JS script before </body> if not present
  if (!html.includes(JS_FILE)) {
    if (html.includes('</body>')) {
      html = html.replace('</body>', `  ${jsTag}\n</body>`);
      didChange = true;
    }
  }

  // Inject scroll-progress div as first child of <body> if not present
  if (!html.includes('class="scroll-progress"')) {
    const bodyOpen = html.match(/<body[^>]*>\s*\n/);
    if (bodyOpen) {
      const idx = bodyOpen.index + bodyOpen[0].length;
      html = html.slice(0, idx) +
             `  <div class="scroll-progress" aria-hidden="true"></div>\n` +
             html.slice(idx);
      didChange = true;
    }
  }

  if (didChange) {
    fs.writeFileSync(f, html);
    changed++;
    console.log('  edited  ' + path.relative(ROOT, f));
  } else {
    skipped++;
  }
}

console.log(`\nDone. ${changed} file(s) edited, ${skipped} skipped (already had references).`);
