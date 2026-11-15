import { defineConfig } from 'vite';

// Relative base so dist/ works at a domain root (Netlify) or a sub-path (GitHub Pages).
export default defineConfig({ base: './' });
