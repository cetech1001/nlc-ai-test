/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // purple: "hsl(280 80% 43.5%)",
                "magenta-light": "hsl(290 100% 72%)",
                magenta: "hsl(286 73% 55%)",
                brand: {
                    purple: "#7B21BA",
                    magenta: "#B339D4",
                    "magenta-light": "#D497FF",
                    "purple-light": "#7B26F0"
                },
                // Adding colors from your main design
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a',
                },
                stone: {
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                    950: '#0c0a09',
                },
                fuchsia: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    700: '#a21caf',
                    800: '#86198f',
                    900: '#701a75',
                },
                violet: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
            },
            backgroundImage: {
                "gradient-button": "linear-gradient(19deg, #FEBEFA 6.78%, #B339D4 34.87%, #7B21BA 61.32%, #7B26F0 91.07%)",
                "gradient-glass": "linear-gradient(198deg, rgba(38, 38, 38, 0.30) 10.03%, rgba(19, 19, 19, 0.30) 75.61%)",
                "gradient-radial": "radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)",
                "gradient-purple": "linear-gradient(135deg, #B339D4 0%, #7B21BA 50%, #4B0BA3 100%)",
                "gradient-purple-dark": "linear-gradient(135deg, #7B21BA 0%, #4B0BA3 50%, #2D0861 100%)",
                "gradient-fuchsia": "linear-gradient(to right, #FEBEFA, #B339D4, #7B21BA)",
                "gradient-blur": "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1))",
                "gradient-autopilot": "linear-gradient(5.46deg, #FEBEFA 10.93%, #B339D4 36.68%, #7B21BA 60.9%, #7B26F0 88.16%)"
            },
            fontFamily: {
                sans: ['Poppins', 'Inter', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'Menlo', 'Monaco', 'monospace'],
                poppins: ['Poppins', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            fontSize: {
                '7xl': ['4.5rem', { lineHeight: '1.1' }],
                '8xl': ['6rem', { lineHeight: '1' }],
                '9xl': ['8rem', { lineHeight: '1' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
                '6xl': '3rem',
            },
            backdropBlur: {
                xs: '2px',
                '4xl': '72px',
                '5xl': '100px',
            },
            boxShadow: {
                'glow': '0px 2px 12px 0px rgba(212, 151, 255, 1.00)',
                'glow-lg': '0px 4px 20px 0px rgba(254, 190, 250, 0.5)',
                'glow-xl': '0px 8px 32px 0px rgba(212, 151, 255, 0.6)',
                'inner-glow': 'inset 0 0 20px rgba(212, 151, 255, 0.3)',
            },
            blur: {
                '4xl': '72px',
                '5xl': '100px',
                '6xl': '128px',
            },
            animation: {
                'gradient-shift': 'gradientShift 15s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                gradientShift: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%': { boxShadow: '0 0 20px rgba(212, 151, 255, 0.3)' },
                    '100%': { boxShadow: '0 0 30px rgba(212, 151, 255, 0.6)' },
                },
            },
        },
    },
    plugins: [],
}
