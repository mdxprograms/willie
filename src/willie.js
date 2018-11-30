const fs = require("fs");
const path = require('path');
const Handlebars = require("handlebars");

/**
 * Should enable ability to create "controllers" for layouts
 * This would handle extra logic
 * Should give option for custom handlebars functions
 * includes needed as well
 */

// read config yaml

// run through pages with templates
const walkSync = (dir, filelist = []) =>
  fs
    .readdirSync(dir)
    .map(file =>
      fs.statSync(path.join(dir, file)).isDirectory()
        ? walkSync(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file))[0]
    );

const templateFiles = walkSync("src/templates");
const pageFiles = walkSync("src/pages");

const template = Handlebars.compile(
  fs.readFileSync("src/templates/layout.html", "utf8")
);

// write pages
fs.writeFileSync("dist/index.html", template({ name: "Josh" }), "utf8");
