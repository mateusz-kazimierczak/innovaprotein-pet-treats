# InnovaProtein

A bilingual product site with a Three.js walkthrough. GitHub Pages builds the page with Jekyll and serves static HTML, CSS, images, and native JavaScript modules.

## Where to make changes

| Change | Source |
| --- | --- |
| Reorder homepage sections | `index.html` |
| Edit a section’s markup | `_includes/sections/` |
| Change the page shell, navigation, or shared brand lockup | `_layouts/default.html`, `_includes/`, and `_data/navigation.json` |
| Edit copy in either language | `_data/locales/en.json` and `_data/locales/es.json`. The `page` and `process` groups contain the same keys in each language. |
| Adjust site-wide styles or the official logo | `assets/css/site.css` and `assets/images/` |
| Change navigation, language selection, or the inquiry draft | The corresponding module in `assets/js/` |
| Edit the 3D experience | `process/walkthrough.mjs` owns the UI, `process/scene.mjs` the renderer and camera, and `process/stations.mjs` the models. The fallback views and the licensed Three.js bundle live alongside them. |
| Configure the inquiry email | `contact_email` in `_config.yml`. An empty address keeps inquiries as local, copyable drafts. |

The homepage ships complete Spanish fallback markup. With scripting enabled, visitors start in English or their saved language. The two public product images retain their original paths so existing references keep working.

## Develop and publish

GitHub Pages supplies Jekyll in production. The matching Jekyll version and local preview dependencies live in `tools/preview/`. With Ruby and Bundler installed, run these commands from the repository root.

```sh
export BUNDLE_GEMFILE="$PWD/tools/preview/Gemfile"
bundle install
bundle exec jekyll serve
```

Open the local URL printed by Jekyll and use `#proceso` for the walkthrough. To produce the static files, run `bundle exec jekyll build`. Jekyll writes them to the ignored `_site/` directory. After building, run `node --test tests/*.test.mjs` with Node 22 or newer to check translation coverage, anchors, assets, the static fallback, and the larval crawl animation. GitHub Pages runs its existing Jekyll build when a change reaches `main`.

The section includes and locale data let maintainers edit one source for each concern. The renderer loads on approach to the walkthrough. [Jekyll includes](https://jekyllrb.com/docs/includes/) · [Jekyll data files](https://jekyllrb.com/docs/datafiles/) · [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
