module.exports = {
  content: ['./src/**/*.tsx', './src/**/*.ts'],
  variants: {
    extend: {
      backgroundColor: ['checked'],
      backgroundPosition: ['hover'],
      borderColor: ['checked'],
      ringWidth: ['focus-visible'],
      textDecoration: ['focus-visible']
    }
  },
  plugins: [require('@thoughtbot/tailwindcss-aria-attributes')],
  theme: {
    fontFamily: {
      sans: "var(--prism-typography-body-font-family, 'Open Sans', sans-serif)"
    },
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        'fadeIn-1': 'fadeIn 1s ease-in-out',
        delayedFadeIn: 'delayedFadeIn .2s ease-in-out'
      },
      backgroundPosition: {
        'bottom-0': '0 -100%',
        'bottom-20': '0 -80%'
      },
      borderWidth: {
        1: '1px',
        3: '3px',
        5: '5px',
        6: '6px'
      },
      boxShadow: {
        swatch: 'inset 0 0 0 1px white,0 0 2px 0 rgba(0,0,0,0.25)'
      },
      colors: {
        primary: 'hsl(var(--swpr-primary) / <alpha-value>)',
        secondary: 'hsl(var(--swpr-secondary) / <alpha-value>)',
        primaryBg: 'hsl(var(--swpr-background) / <alpha-value>)',
        black: 'hsl(var(--swpr-black) / <alpha-value>)',
        buttonColor: 'hsl(var(--swpr-button) / <alpha-value>)',
        buttonBgColor: 'hsl(var(--swpr-button-bg) / <alpha-value>)',
        buttonBorderColor: 'hsl(var(--swpr-button-border) / <alpha-value>)',
        buttonHoverColor: 'hsl(var(--swpr-button-hover) / <alpha-value>)',
        buttonHoverBgColor: 'hsl(var(--swpr-button-hover-bg) / <alpha-value>)',
        buttonActiveColor: 'hsl(var(--swpr-button-active) / <alpha-value>)',
        buttonActiveBgColor: 'hsl(var(--swpr-button-active-bg) / <alpha-value>)',
        danger: 'hsl(var(--swpr-danger) / <alpha-value>)',
        error: 'hsl(var(--swpr-error) / <alpha-value>)',
        grey: 'hsl(var(--swpr-grey) / <alpha-value>)',
        'light-grey': 'hsl(var(--swpr-light-grey) / <alpha-value>)',
        lightest: 'hsl(var(--swpr-background) / <alpha-value>)',
        'near-black': 'hsl(var(--swpr-near-black) / <alpha-value>)',
        success: 'hsl(var(--swpr-success) / <alpha-value>)',
        warning: 'hsl(var(--swpr-warning) / <alpha-value>)',
        white: 'hsl(var(--swpr-white) / <alpha-value>)',
        light: 'hsl(var(--swpr-light-grey) / <alpha-value>)',
        dark: 'hsl(var(--swpr-near-black) / <alpha-value>)',
        'swdc-surface-black': 'hsl(var(--swdc-surface-black) / <alpha-value>)',
        'swdc-surface-white': 'hsl(var(--swdc-surface-white) / <alpha-value>)',
        'swdc-surface-pure-white': 'hsl(var(--swdc-surface-pure-white) / <alpha-value>)',
        'swdc-surface-pure-white-half': 'hsl(var(--swdc-surface-pure-white-half) / <alpha-value>)',
        'swdc-error-25': 'hsl(var(--swdc-error-25) / <alpha-value>)',
        'swdc-error-85': 'hsl(var(--swdc-error-85) / <alpha-value>)',
        'swdc-alert-25': 'hsl(var(--swdc-alert-25) / <alpha-value>)',
        'swdc-alert-90': 'hsl(var(--swdc-alert-90) / <alpha-value>)',
        'swdc-affirm-35': 'hsl(var(--swdc-affirm-35) / <alpha-value>)',
        'swdc-affirm-50': 'hsl(var(--swdc-affirm-50) / <alpha-value>)',
        'swdc-affirm-85': 'hsl(var(--swdc-affirm-85) / <alpha-value>)',
        'swdc-info-25': 'hsl(var(--swdc-info-25) / <alpha-value>)',
        'swdc-info-50': 'hsl(var(--swdc-info-50) / <alpha-value>)',
        'swdc-info-85': 'hsl(var(--swdc-info-85) / <alpha-value>)'
      },
      fontFamily: {
        title: 'var(--prism-typography-title-font-style)'
      },
      fontSize: {
        '2xs': ['10px', '12px'],
        '1.5xs': ['.8125rem', '1.3125rem'],
        '2.5xl': ['1.7rem', '2.2rem'],
        tb: ['17px', '24px']
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        delayedFadeIn: {
          '0%': { opacity: 0 },
          '25%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      },
      margin: {
        4.5: '1.125rem',
        'em-0.5': '0.5em',
        'em-1': '1em'
      },
      padding: {
        '2/4': '50%',
        '3/4': '75%'
      },
      screens: {
        xs: '475px',
        tb: { max: '473px' }
      },
      transitionProperty: {
        'background-position': 'background-position',
        width: 'width'
      },
      width: {
        '1/10': '10%'
      }
    }
  }
}
