import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const output = new URL('../_site/', import.meta.url);
const html = await readFile(new URL('index.html', output), 'utf8');
const { messages } = await import(new URL('assets/js/messages.mjs', output));
const { language, routes } = await import(new URL('process/content.mjs', output));

test('locale files cover the same page and walkthrough keys', () => {
  for (const dictionary of [messages, language]) {
    assert.deepEqual(Object.keys(dictionary.en).sort(), Object.keys(dictionary.es).sort());
    for (const [key, reference] of Object.entries(dictionary.en)) {
      const translated = dictionary.es[key];
      if (Array.isArray(reference)) {
        assert.equal(translated.length, reference.length, key);
        for (const text of [...reference, ...translated]) assert.ok(text.trim(), key);
      } else {
        assert.ok(reference.trim() && translated.trim(), key);
      }
    }
  }
  for (const match of html.matchAll(/data-(?:i18n(?:-alt)?|placeholder)="([^"]+)"/g)) {
    assert.ok(messages.en[match[1]], match[1]);
  }
  for (const match of html.matchAll(/data-(?:text|label)="([^"]+)"/g)) {
    assert.ok(language.en[match[1]], match[1]);
  }
  for (const stage of new Set(Object.values(routes).flat())) {
    assert.equal(language.en[stage].length, 5, stage);
  }
});

test('the static page includes its sections, anchors and asset files', async () => {
  assert.doesNotMatch(html, /{%|{{|data:image\/png;base64,/);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), match[1]);
  for (const anchor of ['inicio','producto','proteina','historia','proceso','distribuidores','contacto']) {
    assert.ok(ids.has(anchor), anchor);
  }
  const links = [...html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)].map(match => match[1]);
  for (const link of new Set(links)) assert.ok((await readFile(new URL(link, output))).length, link);
  assert.match(html, /class="flow-fallback-copy"[^>]*>\s*Para el lanzamiento/);
});
