const { createApp } = require("./app");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const dataFilePath = process.env.DATA_FILE;

const app = createApp({ dataFilePath });

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`AppDeployCI listening on http://0.0.0.0:${port}`);
});

