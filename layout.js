const express = require("express");
const Layout = require("@podium/layout");
const Handlebars = require("hbs");
const path = require("path");
const fs = require("fs");
const fetchMiddleware = require("./middleware");
const { basePath, port, isDevelopmentEnv, urls } = require("./config");

const registeredPodlets = {};

Handlebars.registerHelper("podlet", function (name, podletUrl) {
  if (!registeredPodlets[name]) {
    registeredPodlets[name] = true;

    console.log("Registered podlet", name, podletUrl);

    const podlet = layout.client.register({
      name: name,
      uri: podletUrl,
      resolveJs: true,
      resolveCss: true,
    });
    podlets.push(podlet);
  }
  return `<div id="${name}"></div>`;
});

const layout = new Layout({
  name: "layout-dittnav",
  pathname: basePath,
  development: isDevelopmentEnv,
  logger: console,
});

const podlets = [
  /*
  layout.client.register({
    name: "podlet-dittnav-personalia",
    uri: urls.dittnavPersonaliaUrl,
    resolveJs: true,
    resolveCss: true,
  }),
  layout.client.register({
    name: "podlet-vta-situasjon",
    uri: urls.vtaSituasjonUrl,
    resolveJs: true,
    resolveCss: true,
  }),
  layout.client.register({
    name: "podlet-dittnav-generelle-fliser",
    uri: urls.dittnavGenerelleFliserUrl,
    resolveJs: true,
    resolveCss: true,
  }),
  layout.client.register({
    name: "podlet-veientilarbeid",
    uri: urls.vtaUrl,
    resolveJs: true,
    resolveCss: true,
  }),
  layout.client.register({
    name: "podlet-dittnav-lenkeliste",
    uri: urls.dittnavLenkelisteUrl,
    resolveJs: true,
    resolveCss: true,
  }),
*/
];

function parseHandlebarsTemplatePodlets() {
  const file = fs.readFileSync("build/index.html", { encoding: "utf-8" });
  const template = Handlebars.compile(file);
  template({});
  layout.client.refreshManifests().then(() => {
    console.log("Manifests refreshed");
  });
}

const app = express();
app.use(layout.middleware());

app.set("view engine", "html");
app.engine("html", Handlebars.__express);
app.set("views", path.resolve(__dirname, "./build"));

app.use(`${layout.pathname()}/static`, express.static("build/static"));
app.use(`/static`, express.static("build/static"));

app.get(`${layout.pathname()}/isAlive|isReady`, (req, res) => {
  res.sendStatus(200);
});

app.get(`${layout.pathname()}`, fetchMiddleware(podlets), (req, res) => {
  res.status(200).render("index", res.locals);
});

app.use((error, req, res, next) => {
  res.status(500).send("<html><body><h1>Internal server error</h1></body></html>");
});

parseHandlebarsTemplatePodlets();

console.log(`Starting on port ${port} with basePath ${basePath}`);
console.log(`http://localhost:${port}${basePath}`);

app.listen(7000);
