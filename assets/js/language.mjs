import { messages } from './messages.mjs';

const preferenceKey = 'innovaprotein-language-choice';

export function translate(key) {
  return messages[document.documentElement.lang][key];
}

function applyLanguage(lang) {
  const copy = messages[lang];
  document.documentElement.lang = lang;
  document.title = copy.pageTitle;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = copy[element.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(image => {
    image.alt = copy[image.dataset.i18nAlt];
  });
  document.querySelectorAll('[data-placeholder]').forEach(input => {
    input.placeholder = copy[input.dataset.placeholder];
  });
  for (const code of Object.keys(messages)) {
    document.getElementById('lang-' + code).setAttribute('aria-pressed', String(code === lang));
  }
  document.dispatchEvent(new Event('site-language-change'));
}

export function initLanguage() {
  let initial = 'en';
  try {
    if (localStorage.getItem(preferenceKey) === 'es') initial = 'es';
  } catch {
    // Browsers that restrict storage can still switch language for this visit.
  }
  applyLanguage(initial);
  for (const code of Object.keys(messages)) {
    document.getElementById('lang-' + code).addEventListener('click', () => {
      applyLanguage(code);
      try {
        localStorage.setItem(preferenceKey, code);
      } catch {
        // The selection is already active in the current document.
      }
    });
  }
}
