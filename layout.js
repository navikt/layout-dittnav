const express = require("express");
const Layout = require("@podium/layout");
const path = require("path");
const fetchMiddleware = require("./middleware");
const { basePath, port, isDevelopmentEnv, urls } = require("./config");

const layout = new Layout({
  name: "layout-dittnav",
  pathname: basePath,
  development: isDevelopmentEnv,
  logger: console,
});

const podlets = [
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
];

const app = express();
app.use(layout.middleware());

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set("views", path.resolve(__dirname, "./build"));

app.use(`${layout.pathname()}/static`, express.static("build/static", { index: false }));
app.use(`/static`, express.static("build/static", { index: false }));

app.get(`${layout.pathname()}/isAlive|isReady`, (req, res) => {
  res.sendStatus(200);
});

app.get(`${layout.pathname()}`, fetchMiddleware(podlets), (req, res) => {
  res.status(200).render("index", res.locals);
});

app.use((error, req, res, next) => {
  res.status(500).send("<html><body><h1>Internal server error</h1></body></html>");
});

layout.client.refreshManifests().then(() => {
  console.log("Manifests refreshed");
});

console.log(`Starting on port ${port} with basePath ${basePath}`);
console.log(`http://localhost:${port}${basePath}`);

app.listen(7000);
