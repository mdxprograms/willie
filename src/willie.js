// native modules
const fs = require("fs-extra");
const path = require("path");

// npm modules
const fm = require("front-matter");
const glob = require("glob");
const handlebars = require("handlebars");

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

const buildSite = () => {
  // get list of files
  const pageFiles = walkSync("src/pages");
  const templateFiles = walkSync("src/templates");

  // register helpers
  glob.sync("src/lib/helpers/**/*.js").forEach(file => {
    const helperName = file
      .split("/")
      .slice(-1)[0]
      .replace(".js", "");

    handlebars.registerHelper(helperName, require(path.resolve(file)));
  });

  // register partials
  glob.sync("src/templates/partials/**/*.html").forEach(file => {
    const partialName = file
      .split("/")
      .slice(-1)[0]
      .replace(".html", "");

    handlebars.registerPartial(
      partialName,
      fs.readFileSync(path.resolve(file), "utf8")
    );
  });

  // clean dist/ and build
  console.log("=========================");
  console.log("===== Building Site =====");
  console.log("=========================\n");

  fs.emptyDir("dist").then(() => {
    pageFiles.forEach(pFile => {
      const filePath = Array.isArray(pFile) ? pFile[0] : pFile;
      const { attributes, body } = fm(fs.readFileSync(filePath, "utf8"));

      let layoutPath = "src/templates/layouts";

      // use filepath if layout unavailable
      if (!attributes.hasOwnProperty("layout")) {
        layoutPath = filePath;
      } else {
        layoutPath += `/${attributes.layout}.html`;
      }

      // get the layout file ready
      const layoutTemp = handlebars.compile(
        fs.readFileSync(layoutPath, "utf8")
      );

      // clean write path
      const writePath = filePath.replace("src/pages/", "").replace(".html", "");

      // re-use as needed
      const data = {
        site: config,
        page: attributes
      };

      // support pages ability to access object properties as well
      data.content = handlebars.compile(body)({...data});

      // no need for extra directory for index.html or 404
      if (writePath !== "index" && writePath !== "404") {
        // create static directory
        fs.ensureDir(`dist/${writePath}`)
          .then(() => {
            // write index.html to static directory
            fs.writeFileSync(
              `dist/${writePath}/index.html`,
              layoutTemp({ ...data }),
              "utf8"
            );
          })
          .catch(err => console.error(err));
      } else {
        // write index.html or 404.html to static root
        fs.writeFileSync(`dist/${writePath}.html`, layoutTemp({ ...data }), "utf8");
      }
    });
  });

  console.log("=========================");
  console.log("======Build Finished=====");
  console.log("=========================\n");
};

// use chokidar to rebuild site when in development env
if (process.env.NODE_ENV === "development") {
  const bs = require("browser-sync").create();

  buildSite();

  bs.watch("./src/**/*").on("change", () => {
    buildSite();
    bs.reload();
  });

  bs.init({
    server: "./dist"
  });
} else {
  buildSite();
}
