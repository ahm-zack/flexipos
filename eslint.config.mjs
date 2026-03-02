import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Ignore legacy/backup files
    ignores: [
      "lib/order-service-backup.ts",
      "lib/eod-report-service.ts",
      "check-user-state.ts",
      "x check-user-state.ts",
      "cleanup-orphaned-users.ts",
      "cleanup-all-orphans.ts",
      "delete-user-by-email.ts",
      "test-supabase-connection.ts",
    ],
  },
  {
    rules: {
      // Allow underscore-prefixed variables to indicate intentionally unused
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Allow @ts-nocheck in legacy files (handled by ignores above)
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
];

export default eslintConfig;
