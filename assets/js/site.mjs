import { initInquiry } from './inquiry.mjs';
import { initLanguage } from './language.mjs';
import { initNavigation } from './navigation.mjs';

initNavigation();
initInquiry();
initLanguage();
document.getElementById('year').textContent = String(new Date().getFullYear());
