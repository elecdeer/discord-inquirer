const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettier = require("eslint-config-prettier");
const importPlugin = require("eslint-plugin-import");

const configForJs = {
  plugins: {
    import: importPlugin,
  },
  rules: {
    ...prettier.rules,
    ...importPlugin.configs.recommended.rules,
    "no-restricted-imports": [
      "error",
      {
        patterns: ["*/src"],
      },
    ],
    "import/order": [
      "error",
      {
        groups: [
          ["builtin", "external"],
          ["parent", "sibling", "index"],
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern: "@alias/**",
            group: "parent",
            position: "before",
          },
        ],
        alphabetize: {
          order: "asc",
        },
        "newlines-between": "always",
      },
    ],
  },
};

const configForTs = {
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      sourceType: "module",
      project: true, // コードから最も近いtsconfig.json
    },
  },
  plugins: {
    "@typescript-eslint": tsPlugin,
    import: importPlugin,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "tsconfig.json",
      },
    },
  },
  rules: {
    ...tsPlugin.configs["recommended-type-checked"].rules,
    ...tsPlugin.configs["stylistic-type-checked"].rules,
    // recommended overrides
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/require-await": "off",
    // custom rules
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      {
        allowString: false,
        allowNumber: false,
        allowNullableBoolean: true,
      },
    ],
  },
};

const eslintConfig = [
  {
    files: ["**/*.js", "*.js"],
    ...configForJs,
  },
  {
    files: ["**/*.ts", "*.ts"],
    ignores: ["**/*.test.ts", "*.test.ts"],
    ...configForTs,
  },
  {
    files: ["**/*.test.ts", "*.test.ts"],
    ...configForTs,
    rules: {
      ...configForTs.rules,
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
];

module.exports = eslintConfig;
