const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");

// embed helper - js, css
module.exports = filepath => {
  const isJS = path.extname(filepath) === ".js";
  const isCSS = path.extname(filepath) === ".css";
  const canEmbed = isJS || isCSS;
  const fullPath = `src/assets/${filepath}`;

  if (fs.existsSync(fullPath) && canEmbed) {
    const file = fs.readFileSync(fullPath, "utf8");

    if (isJS) {
      return new handlebars.SafeString(`<script>${file}</script>`);
    } else {
      return new handlebars.SafeString(`<style>${file}</style>`);
    }
  }

  return console.error(`Embed file failed for: ${filepath}`);
};
