import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execFileSync } from "node:child_process";
import { componentTagger } from "lovable-tagger";

const codeUpdatedAt = (() => {
  if (process.env.VITE_CODE_UPDATED_AT) return process.env.VITE_CODE_UPDATED_AT;
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
})();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_CODE_UPDATED_AT': JSON.stringify(codeUpdatedAt),
  },
  server: {
    host: "::",
    port: 8080,
  },
  // Lovable serves at the root; GitHub Pages sets its repository path in CI.
  base: process.env.GITHUB_PAGES === 'true' ? '/trope-forge-hub/' : '/',
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
