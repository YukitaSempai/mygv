const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, 'html');
const SECTIONS_DIR = path.join(HTML_DIR, 'sections');

const PAGES = [
  'index.html', 'gvnb.html', 'gvns.html', 'packages.html',
  'course-map.html', 'tournament.html', 'corporate.html',
 'mission-statement.html',
  'terms-2026.html', 'about.html', 'contact.html', 'etransfer.html',
  'buy.html', 'careers.html', 'press.html', 'faq.html',
  'privacy.html', 'accessibility.html', 'registro.html'
];

const SHARED = ['navbar', 'footer', 'scripts', 'body-close'];

function readSection(name) {
  const file = path.join(SECTIONS_DIR, name + '.html');
  try {
    return fs.readFileSync(file, 'utf8').trimEnd();
  } catch (e) {
    console.error('  MISSING section: ' + name);
    return '';
  }
}

function replaceBetween(content, name, newContent) {
  const open = `<!--${name}-->`;
  const close = `<!--/${name}-->`;
  const start = content.indexOf(open);
  const end = content.indexOf(close);
  if (start === -1 || end === -1) {
    console.error(`  MISSING markers: ${name}`);
    return content;
  }
  const before = content.slice(0, start + open.length);
  const after = content.slice(end);
  return before + '\n' + newContent + '\n' + after;
}

PAGES.forEach(file => {
  const filePath = path.join(HTML_DIR, file);
  console.log('Built: ' + file);
  let content = fs.readFileSync(filePath, 'utf8');

  SHARED.forEach(s => {
    content = replaceBetween(content, s.toUpperCase(), readSection(s));
  });

  if (file === 'index.html') {
    content = replaceBetween(content, 'HERO', readSection('hero'));
  }

  fs.writeFileSync(filePath, content, 'utf8');
});
