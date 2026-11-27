---
layout: null
---
export const messages = {
  en: {{ site.data.locales.en.page | jsonify }},
  es: {{ site.data.locales.es.page | jsonify }}
};
