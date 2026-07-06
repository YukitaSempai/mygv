const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const HTML_DIR = path.join(ROOT, 'html');
const SECTIONS_DIR = path.join(HTML_DIR, 'sections');

function readSection(name) {
  const file = path.join(SECTIONS_DIR, name + '.html');
  try {
    return fs.readFileSync(file, 'utf8').replace(/\s+$/, '');
  } catch (e) {
    console.error('Missing section: ' + name + '.html');
    return '<!-- MISSING SECTION: ' + name + ' -->';
  }
}

function buildPage(templateFile, contentSection, bodyClass) {
  const templatePath = path.join(HTML_DIR, templateFile);
  let template = fs.readFileSync(templatePath, 'utf8');

  // Replace BODY-CLASS marker
  template = template.replace('<!--BODY-CLASS-->', bodyClass || '');

  // Replace SECTION markers (navbar, footer, scripts, body-close, etc.)
  template = template.replace(/<!--SECTION:([\w-]+)-->/g, function (_, name) {
    return readSection(name);
  });

  // Replace PAGE-CONTENT marker (for subpages)
  if (contentSection) {
    template = template.replace('<!--PAGE-CONTENT-->', readSection(contentSection));
  }

  return template;
}

const PAGES = [
  { template: '_template.html',       output: 'index.html',       bodyClass: 'page-home' },
  { template: '_template-page.html',  content: 'gvnb',              bodyClass: 'page-gvnb',  output: 'gvnb.html' },
  { template: '_template-page.html',  content: 'gvns',              bodyClass: 'page-gvns',  output: 'gvns.html' },
  { template: '_template-page.html',  content: 'packages',          bodyClass: 'page-packages',  output: 'packages.html' },
  { template: '_template-page.html',  content: 'course-map',        bodyClass: 'page-course-map',  output: 'course-map.html' },
  { template: '_template-page.html',  content: 'tournament',        bodyClass: 'page-tournament',  output: 'tournament.html' },
  { template: '_template-page.html',  content: 'corporate',         bodyClass: 'page-corporate',  output: 'corporate.html' },
  { template: '_template-page.html',  content: 'brochure-personalized', bodyClass: 'page-brochure', output: 'brochure-personalized.html' },
  { template: '_template-page.html',  content: 'mission-statement',   bodyClass: 'page-mission', output: 'mission-statement.html' },
  { template: '_template-page.html',  content: 'terms-2026',          bodyClass: 'page-terms', output: 'terms-2026.html' },
  { template: '_template-page.html',  content: 'about',            bodyClass: 'page-about',  output: 'about.html' },
  { template: '_template-page.html',  content: 'contact',           bodyClass: 'page-contact', output: 'contact.html' },
  { template: '_template-page.html',  content: 'etransfer',          bodyClass: 'page-etransfer', output: 'etransfer.html' },
  { template: '_template-page.html',  content: 'page-buy',          output: 'buy.html' },
  { template: '_template-page.html',  content: 'page-careers',      output: 'careers.html' },
  { template: '_template-page.html',  content: 'page-press',        output: 'press.html' },
  { template: '_template-page.html',  content: 'page-faq',          output: 'faq.html' },
  { template: '_template-page.html',  content: 'page-privacy',      output: 'privacy.html' },
  { template: '_template-page.html',  content: 'page-accessibility', output: 'accessibility.html' },
  { template: '_template-page.html',  content: 'page-registro',     output: 'registro.html' },
];

PAGES.forEach(function (page) {
  const result = buildPage(page.template, page.content, page.bodyClass);
  const outputPath = path.join(HTML_DIR, page.output);
  fs.writeFileSync(outputPath, result, 'utf8');
  console.log('Built: ' + page.output);
});
