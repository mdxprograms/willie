const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");
const hljs = require("highlight.js");
const md = require("markdown-it")({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="${lang}">${hljs.highlight(lang, str, true).value}</code></pre>`;
      } catch (__) {}
    }

    return (
      `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
    );
  }
});

// markdown helper - parses markdown to html
module.exports = filepath => {
  const isMD =
    path.extname(filepath) === ".md" || path.extname(filepath) === "markdown";

  if (fs.existsSync(path.resolve(filepath)) && isMD) {
    return new handlebars.SafeString(
      md.render(fs.readFileSync(path.resolve(filepath), "utf8"))
    );
  }

  return console.error(`Markdown file failed for: ${filepath}`);
};
