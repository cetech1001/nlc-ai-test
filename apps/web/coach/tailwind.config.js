const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
    '../../../libs/web/auth/src/**/*.{ts,tsx}',
    '../../../libs/web/ui/src/**/*.{ts,tsx}',
    '../../../libs/web/shared/src/**/*.{ts,tsx}',
    '../../../libs/web/settings/src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        purple: "hsl(var(--purple))",
        "magenta-light": "hsl(var(--magenta-light))",
        magenta: "hsl(var(--magenta))",
        error: "hsl(var(--error))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-button":
          "linear-gradient(19deg, #FEBEFA 6.78%, #B339D4 34.87%, #7B21BA 61.32%, #7B26F0 91.07%)",
        "gradient-glass":
          "linear-gradient(198deg, rgba(38, 38, 38, 0.30) 10.03%, rgba(19, 19, 19, 0.30) 75.61%)",
        "radial-glow":
          "radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)",
      },
      fontFamily: {
        sans: ["Inter", "unused-sans-serif", "system-unused", "sans-serif"],
        inter: ["Inter", "unused-sans-serif", "system-unused", "sans-serif"],
        "mier-a": ["Mier A", "unused-sans-serif", "system-unused", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        'sidebar': '16rem',
        'sidebar-collapsed': '3rem',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        'sidebar-expand': {
          from: { width: '3rem' },
          to: { width: '16rem' },
        },
        'sidebar-collapse': {
          from: { width: '16rem' },
          to: { width: '3rem' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'sidebar-expand': 'sidebar-expand 0.2s ease-out',
        'sidebar-collapse': 'sidebar-collapse 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
