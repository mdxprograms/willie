const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");
const fm = require("front-matter");

// site config
const config = require("./config.json");

// walkSync - recursive file finder with relative path
const walkSync = (dir, filelist = []) =>
  fs
    .readdirSync(dir)
    .map(file =>
      fs.statSync(path.join(dir, file)).isDirectory()
        ? walkSync(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file))[0]
    );

// get list of files
const pageFiles = walkSync("src/pages");
const templateFiles = walkSync("src/templates");

// clean dist/ first
fs.emptyDir("dist").then(() => {
  pageFiles.forEach(pFile => {
    const { attributes, body } = fm(fs.readFileSync(pFile, "utf8"));

    // layout is required per page
    if (!attributes.hasOwnProperty("layout")) {
      return console.error(`File: ${pFile} must include a layout property`);
    }

    const layoutTemp = handlebars.compile(
      fs.readFileSync(`src/templates/layouts/${attributes.layout}.html`, "utf8")
    );

    // if permalink specified, use it
    const writePath = attributes.hasOwnProperty("permalink")
      ? attributes.permalink
      : pFile.replace("src/pages/", "").replace(".html", "");

    // no need for extra directory for index.html
    if (writePath !== "index") {
      fs.ensureDir(`dist/${writePath}`)
        .then(() => {
          fs.writeFileSync(
            `dist/${writePath}/index.html`,
            layoutTemp({ site: config, page: attributes, content: body }),
            "utf8"
          );
        })
        .catch(err => console.error(err));
    } else {
      fs.writeFileSync(
        `dist/index.html`,
        layoutTemp({ site: config, page: attributes, content: body }),
        "utf8"
      );
    }
  });
});
