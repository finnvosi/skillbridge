import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Global override (no `files` → applies to every file, last in array wins).
    // Active dashboards fetch inside useEffect then setState — the
    // `react-hooks/set-state-in-effect` rule flags this as an error and would
    // block `pnpm run lint`. Demoted to a warning, not an error.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
