// native modules
const fs = require("fs-extra");
const path = require("path");

// npm modules
const fm = require("front-matter");
const glob = require("glob");
const handlebars = require("handlebars");
const babel = require("@babel/core");
const UglifyJS = require("uglify-js");

// site config
const config = require("./config.json");

const registerHelpers = helperFiles =>
  helperFiles.forEach(file => {
    const helperName = file
      .split("/")
      .slice(-1)[0]
      .replace(".js", "");

    handlebars.registerHelper(helperName, require(path.resolve(file)));
  });

const registerPartials = partialFiles =>
  partialFiles.forEach(file => {
    const partialName = file
      .split("/")
      .slice(-1)[0]
      .replace(".html", "");

    handlebars.registerPartial(
      partialName,
      fs.readFileSync(path.resolve(file), "utf8")
    );
  });

const compileJSAssets = assetFiles =>
  fs.ensureDir("dist/assets/js").then(() =>
    assetFiles.scripts.forEach(scriptPath => {
      babel
        .transformFileAsync(scriptPath, { presets: ["@babel/preset-env"] })
        .then(result =>
          fs.writeFileSync(
            scriptPath.replace("src", "dist"),
            UglifyJS.minify(result.code).code,
            "utf8"
          )
        );
    })
  );

const getData = dataFiles => {
  let data = {};

  dataFiles.forEach(dataFile => {
    const name = dataFile
      .split("\\")
      .pop()
      .split("/")
      .pop()
      .replace(".json", "");

    data[name] = require(path.resolve(dataFile));
  });

  return data;
};

// main build process
const buildSite = (reload = null) => {
  // clean dist/ and build
  console.log("===== Building Site =====");

  fs.emptyDir("dist")
    .then(() => {
      // get list of files
      const pageFiles = glob.sync("src/pages/**/*.html");
      const helperFiles = glob.sync("src/lib/helpers/**/*.js");
      const partialFiles = glob.sync("src/templates/partials/**/*.html");
      const assetFiles = {
        scripts: glob.sync("src/assets/js/**/*.js"),
        styles: glob.sync("src/assets/css/**/*.css")
      };
      const dataFiles = glob.sync("src/data/**/*.json");

      const globalData = {
        site: config,
        data: getData(dataFiles)
      };

      // register helpers
      registerHelpers(helperFiles);

      // register partials
      registerPartials(partialFiles);

      // compile js assets
      compileJSAssets(assetFiles);

      // copy image assets
      fs.copy("src/assets/img", "dist/assets/img");

      fs.copy("src/assets/css", "dist/assets/css");

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
        const writePath = filePath
          .replace("src/pages/", "")
          .replace(".html", "");

        // re-use as needed
        const data = {
          page: attributes,
          ...globalData
        };

        // support pages ability to access object properties as well
        data.content = handlebars.compile(body)({ ...data });

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
          fs.writeFileSync(
            `dist/${writePath}.html`,
            layoutTemp({ ...data }),
            "utf8"
          );
        }
      });
    })
    .then(() => reload && reload());

  console.log("======Build Finished=====");
};

/**
 * Run Willie!
 * use browserSync for watch and build trigger
 * use middleware for defaulting 404 page
 */
if (process.env.NODE_ENV === "development") {
  const bs = require("browser-sync").create();

  buildSite();

  bs.watch("./src/**").on("change", () => {
    buildSite(bs.reload);
  });

  bs.init(
    {
      server: "./dist"
    },
    (err, bs) => {
      bs.addMiddleware("*", (req, res) => {
        res.writeHead(302, {
          location: "/404.html"
        });
        res.end("Redirecting...");
      });
    }
  );
} else {
  buildSite();
}
