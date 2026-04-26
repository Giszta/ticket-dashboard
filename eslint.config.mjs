// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "playwright-report/**", "test-results/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React Hooks plugin
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
    },
  },

  {
    files: ["e2e/**/*.ts", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },

  prettierConfig,
);

export default eslintConfig;
