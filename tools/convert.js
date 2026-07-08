const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, '..', 'html');
const SECTIONS_DIR = path.join(HTML_DIR, 'sections');

const PAGES = [
  'index.html', 'gvnb.html', 'gvns.html', 'packages.html',
  'course-map.html', 'tournament.html', 'corporate.html',
  'brochure-personalized.html', 'mission-statement.html',
  'terms-2026.html', 'about.html', 'contact.html', 'etransfer.html',
  'buy.html', 'careers.html', 'press.html', 'faq.html',
  'privacy.html', 'accessibility.html', 'registro.html'
];

function stripBOM(s) {
  return s.replace(/^\ufeff/, '');
}

function removeAllBOM(s) {
  return s.replace(/\ufeff/g, '');
}

function hasMarker(content, name) {
  return content.includes(`<!--${name}-->`);
}

function findClosingTag(content, pos, tag) {
  const open = `<${tag}`;
  const close = `</${tag}>`;
  const tagStart = content.indexOf(open, pos);
  if (tagStart === -1) return -1;
  const afterOpen = content.indexOf('>', tagStart);
  if (afterOpen === -1) return -1;
  const closeIdx = content.indexOf(close, afterOpen + 1);
  return closeIdx !== -1 ? closeIdx + close.length : -1;
}

function wrapSection(content, startStr, tagName, wrapName) {
  if (hasMarker(content, wrapName)) {
    console.log(`  [SKIP] ${wrapName}`);
    return content;
  }
  const startIdx = content.indexOf(startStr);
  if (startIdx === -1) {
    console.log(`  [FAIL] ${wrapName}: start not found`);
    return content;
  }
  const endIdx = findClosingTag(content, startIdx, tagName);
  if (endIdx === -1) {
    console.log(`  [FAIL] ${wrapName}: </${tagName}> not found`);
    return content;
  }
  const section = content.slice(startIdx, endIdx).trim();
  console.log(`  [OK]   ${wrapName} (${section.length} chars)`);
  return content.slice(0, startIdx) +
    `<!--${wrapName}-->\n${section}\n<!--/${wrapName}-->` +
    content.slice(endIdx);
}

function wrapScripts(content) {
  if (hasMarker(content, 'SCRIPTS')) return content;
  const afterFooter = content.indexOf('</footer>');
  if (afterFooter === -1) return content;
  const firstScript = content.indexOf('<script', afterFooter);
  if (firstScript === -1) return content;
  const bodyClose = content.indexOf('</body>');
  const lastScript = content.lastIndexOf('</script>', bodyClose);
  if (lastScript === -1) return content;
  const endIdx = lastScript + '</script>'.length;
  const section = content.slice(firstScript, endIdx).trim();
  console.log(`  [OK]   SCRIPTS (${section.length} chars)`);
  return content.slice(0, firstScript) +
    `<!--SCRIPTS-->\n${section}\n<!--/SCRIPTS-->` +
    content.slice(endIdx);
}

function wrapBodyClose(content) {
  if (hasMarker(content, 'BODY-CLOSE')) return content;
  const closeScripts = content.indexOf('<!--/SCRIPTS-->');
  const closeBody = content.indexOf('</body>');
  if (closeScripts === -1 || closeBody === -1) return content;
  const between = content.slice(closeScripts + '<!--/SCRIPTS-->'.length, closeBody).trim();
  console.log(`  [OK]   BODY-CLOSE (${between.length} chars)`);
  return content.slice(0, closeScripts + '<!--/SCRIPTS-->'.length) +
    `\n<!--BODY-CLOSE-->\n${between}\n<!--/BODY-CLOSE-->` +
    content.slice(closeBody);
}

// First, strip BOM from section files so builds don't re-introduce it
console.log('=== Stripping BOM from section files ===');
const sectionFiles = fs.readdirSync(SECTIONS_DIR);
sectionFiles.forEach(f => {
  const fp = path.join(SECTIONS_DIR, f);
  let c = fs.readFileSync(fp, 'utf8');
  const stripped = removeAllBOM(c);
  if (stripped !== c) {
    fs.writeFileSync(fp, stripped, 'utf8');
    console.log(`  Stripped BOM from sections/${f}`);
  }
});

console.log('\n=== Adding markers to page files ===');
PAGES.forEach(file => {
  const filePath = path.join(HTML_DIR, file);
  console.log(`\n${file}:`);
  let content = fs.readFileSync(filePath, 'utf8');
  content = removeAllBOM(content);

  content = wrapSection(content, 'NAVBAR', 'nav', 'NAVBAR');
  content = wrapSection(content, 'FOOTER', 'footer', 'FOOTER');
  content = wrapScripts(content);
  content = wrapBodyClose(content);

  if (file === 'index.html') {
    content = wrapSection(content, 'HERO — 2026 Golf Visa', 'section', 'HERO');
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('\n=== Done. Now delete unnecessary section files. ===');
