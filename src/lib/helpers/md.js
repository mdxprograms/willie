const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");

// markdown helper - parses markdown to html
module.exports = filepath => {
  const isMD =
    path.extname(filepath) === ".md" || path.extname(filepath) === "markdown";

  if (fs.existsSync(filepath)) {
    const file = fs.readFileSync(filepath, "utf8");

    if (isJS) {
      return new handlebars.SafeString(`<script>${file}</script>`);
    } else {
      return new handlebars.SafeString(`<style>${file}</style>`);
    }
  }

  return console.error(`Embed file failed for: ${filepath}`);
};
