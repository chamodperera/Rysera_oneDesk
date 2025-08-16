import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: [
    "src/**/*",
    "!src/**/*.test.*",
    "!src/**/*.spec.*",
    "!src/__tests__/**/*",
  ],
  clean: true,
  format: ["cjs"],
  ...options,
}));
