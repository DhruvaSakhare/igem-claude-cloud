import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// Import directly from the file (not the ./src/utils barrel) so loading this
// config doesn't transitively pull in pages.ts → the content pages, whose image
// asset imports esbuild can't process while bundling the config.
import { stringToSlug } from "./src/utils/stringToSlug";

// https://vitejs.dev/config/
export default () => {
  const env = loadEnv("", process.cwd());
  return defineConfig({
    base: `/${stringToSlug(env.VITE_TEAM_NAME)}/`,
    plugins: [react()],
    // Allow importing image assets from the wiki/ folder one level above this
    // repo (see the asset imports in src/contents/model.tsx). Dev-serving only.
    server: {
      fs: {
        allow: [".."],
      },
    },
  });
};
