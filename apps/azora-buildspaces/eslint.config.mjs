import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Local rule overrides to allow incremental fixes
  {
    rules: {
      // Allow `any` during staged cleanup — demote to warning
      "@typescript-eslint/no-explicit-any": "warn",
      // Many legacy strings include unescaped quotes; demote to warning
      "react/no-unescaped-entities": "warn"
    }
  }
]);
