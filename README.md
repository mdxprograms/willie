![homeboy](willie.jpg)

> Because, pimpin' ain't easy fam - Willie Nelson

A simple static site generator written in node with handlebars templating baked-in.

- `pages` exist in `src/pages/`
- `templates` which render pages (layouts/includes) exist in `src/templates/`
- Site wide variables exist in `src/config.json` and can be accessed via `{{ site.title }}`
- Page variables exist within the page's frontmatter, eg:


[Frontmatter](#frontmatter)

[Data Files](#data-files)

[Routing](#routing)

[Helpers](#helpers)


## Frontmatter

```yaml
---
title: Home
layout: default
people:
- name: bond
- name: fett
---
```

A list example from frontmatter data:

```handlebars
<ul>
  {{#page.people}}
    <li>{{ name }}</li>
  {{/page.people}}
</ul>
```

The page would then use the `src/templates/layouts/default.html` as a layout file.


## Data Files

Data files are located in `src/data` as json files.
If a data file is at `src/data/people.json` then you can access it via

```handlebars
{{#data.people}}
  {{ name }}
{{/data.people}}
```

## Routing

Routing is handled based on file paths (recursively), eg:

```
src/pages/resources/magazines.html
```

routes to

```
<your_site_url>/resources/magazines/
```


## Helpers

Helpers are available to add in `src/lib/helpers`

#### embed
> helper which you can use to embed a javascript or css file in your html
  It pulls from the `src/assets/` directory:

Javscript file embed from `src/assets/js/embed-me.js`

```handlebars
{{embed "js/embed-me.js"}}
```

#### md
> helper to add markdown files to your html

```handlebars
{{md "README.md"}}
```
