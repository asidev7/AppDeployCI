const { createApp } = require("../src/app");

let cachedApp;

function getApp() {
  if (!cachedApp) {
    const dataFilePath = process.env.DATA_FILE;
    cachedApp = createApp({ dataFilePath });
  }
  return cachedApp;
}

module.exports = (req, res) => {
  const app = getApp();
  return app(req, res);
};

