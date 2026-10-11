import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages serves a project site at https://<user>.github.io/<repo>/,
 * so the built assets must be requested from "/<repo>/".
 *
 * - In GitHub Actions, GITHUB_REPOSITORY ("owner/repo") gives the right base
 *   automatically, whatever you name the repository.
 * - A repo named "<user>.github.io" is served from the domain root, so "/".
 * - Locally (npm run dev) the base is "/".
 * - VITE_BASE overrides everything (e.g. for a custom domain: VITE_BASE=/).
 */
function resolveBase(): string {
  const override = process.env.VITE_BASE;
  if (override) return override.endsWith('/') ? override : `${override}/`;

  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (process.env.GITHUB_ACTIONS && repo && !repo.endsWith('.github.io')) {
    return `/${repo}/`;
  }
  return '/';
}

export default defineConfig({
  base: resolveBase(),
  plugins: [react()],
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
