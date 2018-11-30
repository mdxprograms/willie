Willie
==

> Because, pimpin' ain't easy fam - Willie Nelson

A simple static site generator written in node

- `pages` exist in `src/pages/`
- `templates` which render pages (layouts/includes) exist in `src/templates/`
- Site wide variables exist in `src/config.json` and can be accessed via `{{ site.title }}`
- Page variables exist within the page's frontmatter, eg:

```yaml
---
title: Home
layout: default
people:
- james bond:
  name: bond
- bobba fett:
  name: fett
---
```

A list example from frontmatter data:

```handlebars
<ul>
  {{#page.people}}
    <li>{{ this.name }}</li>
  {{/page.people}}
</ul>
```

The page would then use the `src/templates/layouts/default.html` as a layout file.

Routing is handled based on file paths (recursively), eg:

`src/pages/resources/magazines.html`
routes to
`<your_site_url>/resources/magazines/`
