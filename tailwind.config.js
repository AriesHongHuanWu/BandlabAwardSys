/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                surface: '#121212',
                surfaceHighlight: '#1E1E1E',
                primary: '#6366f1', // Indigo-500
                secondary: '#ec4899', // Pink-500
                accent: '#8b5cf6', // Violet-500
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
