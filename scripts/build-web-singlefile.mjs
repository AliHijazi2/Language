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

html = html.replace(scriptTag, `<script>${js}</script>`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
// .nojekyll verhindert, dass GitHub Pages die Dateien durch Jekyll verarbeitet.
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`Fertig: ${OUT}/index.html (${(html.length / 1024).toFixed(0)} kB)`);
