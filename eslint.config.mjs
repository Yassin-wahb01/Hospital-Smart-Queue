import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import boundaries from "eslint-plugin-boundaries";
import globals from "globals";

export default [
  { ignores: ["dist"] },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "boundaries": boundaries,
    },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        {
          type: "app",
          pattern: "src/app",
          mode: "folder"
        },
        {
          type: "feature",
          pattern: "src/features/*",
          mode: "folder",
          capture: ["featureName"]
        },
        {
          type: "components",
          pattern: "src/components",
          mode: "folder"
        },
        {
          type: "hooks",
          pattern: "src/hooks",
          mode: "folder"
        },
        {
          type: "utils",
          pattern: "src/utils",
          mode: "folder"
        },
        {
          type: "assets",
          pattern: "src/assets",
          mode: "folder"
        },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "app",
              allow: ["feature", "components", "hooks", "utils", "assets"],
            },
            {
              from: "feature",
              allow: [
                "components", "hooks", "utils", "assets",
                ["feature", { featureName: "{{from.featureName}}" }]
              ],
            },
            {
              from: "components",
              allow: ["hooks", "utils", "assets"],
            },
            {
              from: "hooks",
              allow: ["utils"],
            },
            {
              from: "utils",
              allow: [],
            },
            {
              from: "assets",
              allow: [],
            },
          ],
        },
      ],
    },
  }
];
