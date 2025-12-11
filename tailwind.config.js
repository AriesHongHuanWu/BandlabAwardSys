/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#f8f9fa', // Google Grey 50
                surface: '#ffffff',
                surfaceHighlight: '#f1f3f4', // Google Grey 100
                primary: '#1a73e8', // Google Blue 600
                secondary: '#ea4335', // Google Red 600
                accent: '#34a853', // Google Green 600
                text: '#202124', // Google Grey 900
                textSecondary: '#5f6368', // Google Grey 700
                border: '#dadce0', // Google Grey 300
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'material-sm': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                'material-md': '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
                'material-lg': '0 4px 6px 0 rgba(60,64,67,0.3), 0 8px 12px 6px rgba(60,64,67,0.15)',
            }
        },
    },
    plugins: [],
}
