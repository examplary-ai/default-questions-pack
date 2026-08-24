import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./.tests/setup.ts"],
    globals: true,
    server: {
      // @examplary/ui ships tsc output with extensionless directory imports,
      // so it has to go through Vite's resolver instead of Node's
      deps: { inline: ["@examplary/ui"] },
    },
  },
});
