import type { Config } from 'tailwindcss'
import { designTokens } from './src/styles/design-tokens'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Escala de espaciado custom basada en Alex Yu (4/6/8)
      spacing: {
        ...designTokens.spacing,
      },
      
      // Colores del sistema de diseño
      colors: {
        primary: designTokens.colors.primary,
        neutral: designTokens.colors.neutral,
        success: designTokens.colors.semantic.success,
        warning: designTokens.colors.semantic.warning,
        error: designTokens.colors.semantic.error,
        info: designTokens.colors.semantic.info,
        
        // Colores de panadería - tonos cálidos
        cream: {
          50: '#fefdf9',
          100: '#fdf8ed',
          200: '#faf0d2',
          300: '#f5e6b8',
          400: '#f0d999',
          500: '#ebcc7a',
          600: '#d4b56e',
          700: '#b8985b',
          800: '#9c7b48',
          900: '#7f5e35',
        },
        
        // Extender colores por defecto de Tailwind manteniendo compatibilidad
        orange: designTokens.colors.primary,
        gray: designTokens.colors.neutral,
        green: designTokens.colors.semantic.success,
        yellow: designTokens.colors.semantic.warning,
        red: designTokens.colors.semantic.error,
        blue: designTokens.colors.semantic.info,
      },
      
      // Tipografía jerárquica
      fontSize: {
        'h1': [`${designTokens.typography.h1.size}px`, {
          lineHeight: `${designTokens.typography.h1.lineHeight}`,
          letterSpacing: designTokens.typography.h1.letterSpacing,
          fontWeight: `${designTokens.typography.h1.weight}`,
        }],
        'h2': [`${designTokens.typography.h2.size}px`, {
          lineHeight: `${designTokens.typography.h2.lineHeight}`,
          letterSpacing: designTokens.typography.h2.letterSpacing,
          fontWeight: `${designTokens.typography.h2.weight}`,
        }],
        'h3': [`${designTokens.typography.h3.size}px`, {
          lineHeight: `${designTokens.typography.h3.lineHeight}`,
          letterSpacing: designTokens.typography.h3.letterSpacing,
          fontWeight: `${designTokens.typography.h3.weight}`,
        }],
        'h4': [`${designTokens.typography.h4.size}px`, {
          lineHeight: `${designTokens.typography.h4.lineHeight}`,
          letterSpacing: designTokens.typography.h4.letterSpacing,
          fontWeight: `${designTokens.typography.h4.weight}`,
        }],
        'h5': [`${designTokens.typography.h5.size}px`, {
          lineHeight: `${designTokens.typography.h5.lineHeight}`,
          fontWeight: `${designTokens.typography.h5.weight}`,
        }],
        'h6': [`${designTokens.typography.h6.size}px`, {
          lineHeight: `${designTokens.typography.h6.lineHeight}`,
          fontWeight: `${designTokens.typography.h6.weight}`,
        }],
        'body': [`${designTokens.typography.body.size}px`, {
          lineHeight: `${designTokens.typography.body.lineHeight}`,
          fontWeight: `${designTokens.typography.body.weight}`,
        }],
        'body-small': [`${designTokens.typography.bodySmall.size}px`, {
          lineHeight: `${designTokens.typography.bodySmall.lineHeight}`,
          fontWeight: `${designTokens.typography.bodySmall.weight}`,
        }],
        'caption': [`${designTokens.typography.caption.size}px`, {
          lineHeight: `${designTokens.typography.caption.lineHeight}`,
          fontWeight: `${designTokens.typography.caption.weight}`,
        }],
      },
      
      // Sombras del sistema
      boxShadow: {
        ...designTokens.shadows,
      },
      
      // Bordes redondeados
      borderRadius: {
        ...designTokens.borderRadius,
      },
      
      // Animaciones
      transitionDuration: {
        fast: designTokens.animations.duration.fast,
        normal: designTokens.animations.duration.normal,
        slow: designTokens.animations.duration.slow,
      },
      
      transitionTimingFunction: {
        'in': designTokens.animations.easing.in,
        'out': designTokens.animations.easing.out,
        'in-out': designTokens.animations.easing.inOut,
      },
      
      // Utilities para componentes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config 