// Design Tokens - Basado en principios de Alex Yu
// Escala de espaciado harmónica 4/6/8

export const designTokens = {
  spacing: {
    xs: 4,     // 0.25rem
    sm: 6,     // 0.375rem  
    md: 8,     // 0.5rem
    lg: 12,    // 0.75rem
    xl: 16,    // 1rem
    '2xl': 24, // 1.5rem
    '3xl': 32, // 2rem
    '4xl': 48, // 3rem
    '5xl': 64, // 4rem
    '6xl': 96, // 6rem
  },
  
  colors: {
    // Paleta principal - Naranja para Oeste Pan
    primary: {
      50: '#fef7ee',
      100: '#fdebd3',
      200: '#fbd4a6',
      300: '#f8b76e',
      400: '#f59234',
      500: '#f97316', // Color principal
      600: '#ea5a0b',
      700: '#c2420c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    
    // Grises neutros
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
    
    // Colores semánticos
    semantic: {
      success: {
        50: '#f0fdf4',
        500: '#16a34a',
        900: '#14532d',
      },
      warning: {
        50: '#fefce8',
        500: '#ca8a04',
        900: '#713f12',
      },
      error: {
        50: '#fef2f2',
        500: '#ef4444',
        900: '#7f1d1d',
      },
      info: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      },
    },
  },
  
  typography: {
    // Jerarquía tipográfica clara
    h1: { 
      size: 36, 
      weight: 700, 
      lineHeight: 1.2,
      letterSpacing: '-0.025em'
    },
    h2: { 
      size: 30, 
      weight: 600, 
      lineHeight: 1.3,
      letterSpacing: '-0.02em'
    },
    h3: { 
      size: 24, 
      weight: 600, 
      lineHeight: 1.4,
      letterSpacing: '-0.015em'
    },
    h4: { 
      size: 20, 
      weight: 600, 
      lineHeight: 1.4,
      letterSpacing: '-0.01em'
    },
    h5: { 
      size: 18, 
      weight: 500, 
      lineHeight: 1.5
    },
    h6: { 
      size: 16, 
      weight: 500, 
      lineHeight: 1.5
    },
    body: { 
      size: 16, 
      weight: 400, 
      lineHeight: 1.6
    },
    bodySmall: { 
      size: 14, 
      weight: 400, 
      lineHeight: 1.5
    },
    caption: { 
      size: 12, 
      weight: 400, 
      lineHeight: 1.4
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const

// Utilitarios para uso en componentes
export type DesignTokens = typeof designTokens
export type SpacingScale = keyof typeof designTokens.spacing
export type ColorScale = keyof typeof designTokens.colors.primary 