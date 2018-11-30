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
    const filePath = Array.isArray(pFile) ? pFile[0] : pFile;
    const { attributes, body } = fm(fs.readFileSync(filePath, "utf8"));

    let layoutPath = "src/templates/layouts";

    // layout is required per page
    if (!attributes.hasOwnProperty("layout")) {
      layoutPath = filePath;
    } else {
      layoutPath += `/${attributes.layout}.html`;
    }

    // get the layout file ready
    const layoutTemp = handlebars.compile(fs.readFileSync(layoutPath, "utf8"));

    // if permalink specified, use it
    const writePath = attributes.hasOwnProperty("permalink")
      ? attributes.permalink
      : filePath.replace("src/pages/", "").replace(".html", "");

    // no need for extra directory for index.html
    if (writePath !== "index") {
      // create static directory
      fs.ensureDir(`dist/${writePath}`)
        .then(() => {
          // write index.html to static directory
          fs.writeFileSync(
            `dist/${writePath}/index.html`,
            layoutTemp({ site: config, page: attributes, content: body }),
            "utf8"
          );
        })
        .catch(err => console.error(err));
    } else {
      // write index.html to static root
      fs.writeFileSync(
        `dist/index.html`,
        layoutTemp({ site: config, page: attributes, content: body }),
        "utf8"
      );
    }
  });
});
