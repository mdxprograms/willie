// native modules
const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");

// npm modules
const handlebars = require("handlebars");
const fm = require("front-matter");

// register helpers
glob.sync("src/lib/helpers/**/*.js").forEach(file => {
  const helperName = file
    .split("/")
    .slice(-1)[0]
    .replace(".js", "");

  handlebars.registerHelper(helperName, require(path.resolve(file)));
});

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

  // clean dist/ first
  console.log("=========================");
  console.log("======House Cleaning=====");
  console.log("=========================\n");

  console.log("=========================");
  console.log("======Building Site======");
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

      // if permalink specified, use it
      const writePath = filePath.replace("src/pages/", "").replace(".html", "");

      const data = {
        site: config,
        page: attributes
      };

      // support pages ability to access object properties as well
      data.content = handlebars.compile(body)({
        site: data.site,
        page: data.page
      });

      // no need for extra directory for index.html
      if (writePath !== "index") {
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
        // write index.html to static root
        fs.writeFileSync("dist/index.html", layoutTemp({ ...data }), "utf8");
      }
    });
  });

  console.log("=========================");
  console.log("======Build Finished=====");
  console.log("=========================\n");
};

// use chokidar to rebuild site when in development env
if (process.env.NODE_ENV === "development") {
  const chokidar = require("chokidar");

  chokidar
    .watch("./src/**/*.*")
    .on("add", path => console.log(`${path} has been added`))
    .on("change", buildSite)
    .on("unlink", path => console.log(`${path} has been removed`));
} else {
  buildSite();
}
