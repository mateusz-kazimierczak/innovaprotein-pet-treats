---
layout: null
---
export const routes = {
  launch: ['source', 'checks', 'pack', 'retail'],
  future: ['rear', 'dry', 'checks', 'pack', 'retail']
};

export const language = {
  en: {{ site.data.locales.en.process | jsonify }},
  es: {{ site.data.locales.es.process | jsonify }}
};
