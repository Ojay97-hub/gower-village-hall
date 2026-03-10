import type { Config } from 'tailwindcss';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-family-sans)'],
                serif: ['var(--font-family-serif)'],
            },
            screens: {
                'nav-md': '848px',
            },
            colors: {
                primary: {
                    50: '#f5f5f0',
                    100: '#e8e8dd',
                    200: '#ccdcc1',
                    300: '#b7c6ad',
                    400: '#8e9a87',
                    500: '#7a8473',
                    600: '#6b7564',
                    700: '#5c6555',
                    800: '#4d5546',
                    900: '#3e4537',
                }
            }
        },
    },
    plugins: [],
} satisfies Config;
