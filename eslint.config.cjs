const jestGlobals = {
  describe: "readonly",
  it: "readonly",
  test: "readonly",
  expect: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
};

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  fetch: "readonly",
  alert: "readonly",
  confirm: "readonly",
};

const nodeGlobals = {
  __dirname: "readonly",
  module: "readonly",
  require: "readonly",
  process: "readonly",
  console: "readonly",
};

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: {
        ...jestGlobals,
        ...nodeGlobals,
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
    },
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        ...browserGlobals,
      },
    },
  },
];
