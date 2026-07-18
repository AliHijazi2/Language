/**
 * Fasst den Expo-Web-Export (dist/) zu einer einzigen, in sich geschlossenen
 * HTML-Datei zusammen (_site/index.html): das JavaScript-Bundle wird direkt in
 * die HTML-Datei eingebettet.
 *
 * Vorteil: Die Seite hat keinerlei externe Verweise mehr und funktioniert daher
 * unabhängig davon, unter welchem Pfad sie liegt – ideal für GitHub Pages, wo
 * die App unter einem Unterpfad wie /Language/ ausgeliefert wird.
 *
 * Voraussetzung: vorher `npx expo export --platform web` ausführen.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const OUT = '_site';
const APP_NAME = 'Paly';

// App-Icon als Data-URI einbetten (favicon, Home-Bildschirm-Icon, Ladeanzeige),
// damit die Seite eigenständig bleibt.
const iconBase64 = fs.readFileSync('assets/web-icon.png').toString('base64');
const iconDataUri = `data:image/png;base64,${iconBase64}`;

let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

const match = html.match(/<script src="([^"]+)"[^>]*><\/script>/);
if (!match) {
  throw new Error('Kein <script src="…">-Tag in dist/index.html gefunden.');
}

const scriptTag = match[0];
const jsRelative = match[1].replace(/^\//, '');
let js = fs.readFileSync(path.join(DIST, jsRelative), 'utf8');
// Verhindern, dass ein "</script>" im Bundle das umschließende <script> beendet.
js = js.replaceAll('</script', '<\\/script');

// WICHTIG: Ersetzung per Funktion übergeben. Andernfalls würde String.replace
// "$"-Sequenzen (z. B. "$&", "$1") im JavaScript-Bundle als Sonderzeichen
// interpretieren und den Code zerstören.
html = html.replace(scriptTag, () => `<script>${js}</script>`);

// Heller Sofort-Hintergrund direkt am <body> (unabhängig von geladenem CSS),
// passend zum hellblauen Look.
html = html.replace('<body>', '<body style="background-color:#CFE7FA;margin:0">');

// Ladeanzeige INNERHALB von #root: bleibt sichtbar, bis die App gemountet ist
// (React ersetzt den Inhalt von #root beim Start). Bleibt sie stehen, wissen
// wir, dass das HTML lädt, aber das JavaScript nicht startet.
const fallback =
  '<div id="ls-loading" style="position:fixed;inset:0;display:flex;align-items:center;' +
  'justify-content:center;background-color:#CFE7FA;">' +
  `<img src="${iconDataUri}" alt="${APP_NAME}" ` +
  'style="width:128px;height:128px;border-radius:28px;box-shadow:0 10px 30px rgba(32,69,107,0.25);" />' +
  '</div>';
html = html.replace('<div id="root"></div>', () => `<div id="root">${fallback}</div>`);

// Als installierbare Web-App im Vollbild lauffähig machen (ohne Browser-Leiste),
// wenn die Seite vom Home-Bildschirm gestartet wird.
const manifest = {
  name: APP_NAME,
  short_name: APP_NAME,
  start_url: '.',
  scope: '.',
  display: 'standalone',
  background_color: '#CFE7FA',
  theme_color: '#CFE7FA',
  orientation: 'portrait',
  icons: [
    { src: iconDataUri, sizes: '256x256', type: 'image/png', purpose: 'any' },
  ],
};
// Evtl. von Expo eingefügte Standard-Favicon-Verweise entfernen (könnten auf
// eine externe Datei zeigen), damit nur unser eingebettetes Icon greift.
html = html.replace(/<link[^>]*rel="(shortcut icon|icon|apple-touch-icon)"[^>]*>/g, '');

const webAppTags = [
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  `<meta name="apple-mobile-web-app-title" content="${APP_NAME}">`,
  '<meta name="theme-color" content="#CFE7FA">',
  `<link rel="apple-touch-icon" href="${iconDataUri}">`,
  `<link rel="icon" type="image/png" href="${iconDataUri}">`,
  `<link rel="manifest" href='data:application/manifest+json,${encodeURIComponent(
    JSON.stringify(manifest),
  )}'>`,
].join('');
html = html.replace('</head>', () => `${webAppTags}</head>`);

// viewport-fit=cover, damit die App unter Notch/Statusleiste bis zum Rand reicht.
html = html.replace(
  /<meta name="viewport"[^>]*\/?>/,
  () =>
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />',
);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
// .nojekyll verhindert, dass GitHub Pages die Dateien durch Jekyll verarbeitet.
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`Fertig: ${OUT}/index.html (${(html.length / 1024).toFixed(0)} kB)`);
