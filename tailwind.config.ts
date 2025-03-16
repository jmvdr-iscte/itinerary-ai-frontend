import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Scan all Vue, JS, and TS files in /src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
