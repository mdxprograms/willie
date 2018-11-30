const fs = require("fs");
const Handlebars = require("handlebars");

/**
 * Should enable ability to create "controllers" for layouts
 * This would handle extra logic
 * Should give option for custom handlebars functions
 * includes needed as well
 */

// read config yaml

// run through pages with templates
const template = Handlebars.compile(
  fs.readFileSync("src/templates/layout.html", "utf8")
);

// write pages
fs.writeFileSync("dist/index.html", template({ name: "Josh" }), "utf8");
