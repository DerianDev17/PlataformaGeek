/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'geek-dark': '#080A12',
        'geek-dark-secondary': '#0F1119',
        'geek-dark-tertiary': '#161822',
        'geek-accent': '#6366F1',
        'geek-accent-text': '#8B8CF8',
        'geek-accent-hover': '#4F46E5',
        'geek-accent-secondary': '#06B6D4',
        'geek-success': '#22C55E',
        'geek-warning': '#FBBF24',
        'geek-danger': '#EF4444',
        'geek-text': '#E2E8F0',
        'geek-text-secondary': '#94A3B8',
        'geek-border': '#1E293B',
        'geek-light': '#FFFFFF',
        'geek-light-secondary': '#F8FAFC',
        'geek-light-tertiary': '#F1F5F9',
        'geek-light-text': '#0F172A',
        'geek-light-text-secondary': '#475569',
        'geek-light-border': '#CBD5E1',
        'geek-sidebar-bg': '#090d17',
        'geek-topbar-bg': '#080b13',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
