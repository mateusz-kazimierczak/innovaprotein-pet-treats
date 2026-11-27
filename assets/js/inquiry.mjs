import { translate } from './language.mjs';

export function initInquiry() {
  const form = document.getElementById('inquiry-form');
  const email = form.dataset.contactEmail;
  const interest = form.elements.namedItem('interest');
  const draft = document.getElementById('draft');
  const result = document.getElementById('form-result');
  const status = document.getElementById('copy-status');

  if (email) {
    document.getElementById('form-hint').dataset.i18n = 'formHintLive';
    document.getElementById('form-submit-text').dataset.i18n = 'formButtonLive';
  }
  document.addEventListener('site-language-change', () => {
    result.hidden = true;
    status.textContent = '';
  });
  document.querySelectorAll('[data-inquiry]').forEach(link => {
    link.addEventListener('click', () => { interest.value = link.dataset.inquiry; });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const choice = interest.selectedOptions[0].textContent;
    const heading = translate('inquiryHeading');
    const message = [
      heading, '',
      translate('inquiryName') + ': ' + data.get('name'),
      'Email: ' + data.get('email'),
      translate('inquiryInterest') + ': ' + choice,
      '', data.get('message') || ''
    ].join('\n');

    draft.value = message;
    result.hidden = false;
    status.textContent = '';
    if (email) {
      const address = encodeURIComponent(email).replace(/%40/g, '@');
      const subject = encodeURIComponent(heading + ' – ' + choice);
      window.location.href = 'mailto:' + address + '?subject=' + subject + '&body=' + encodeURIComponent(message);
    }
    result.scrollIntoView({
      block: 'nearest',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  });

  document.getElementById('copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draft.value);
      status.textContent = translate('copied');
    } catch {
      draft.focus();
      draft.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Keep the draft selected for manual copying. */ }
      status.textContent = translate(copied ? 'copied' : 'copyFailed');
    }
  });
}
