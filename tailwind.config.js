/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                surface: 'var(--surface)',
                surfaceHighlight: 'var(--surface-highlight)',
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                accent: 'var(--accent)',
                text: 'var(--text)',
                textSecondary: 'var(--text-secondary)',
                border: 'var(--border)',
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'material-sm': '0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
                'material-md': '0 1px 3px 0 rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15)',
                'material-lg': '0 4px 6px 0 rgba(0,0,0,0.3), 0 8px 12px 6px rgba(0,0,0,0.15)',
            }
        },
    },
    plugins: [],
}
