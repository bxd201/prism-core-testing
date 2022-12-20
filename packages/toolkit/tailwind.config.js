const plugin = require('tailwindcss/plugin')

const backfaceVisibility = plugin(function({addUtilities}) {
  addUtilities({
    '.backface-visible': {
      'backface-visibility': 'visible',
    },
    '.backface-hidden': {
      'backface-visibility': 'hidden',
    }
  })
});

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
  plugins: [
    require('@thoughtbot/tailwindcss-aria-attributes'),
    backfaceVisibility
  ],
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
        // TODO: the hardcoded 100%s here should be able to be <alpha-value>, but Facets renders them all as black (I think we need to implement a plugin)
        primary: 'hsl(var(--swpr-primary) / 100%)',
        secondary: 'hsl(var(--swpr-secondary) / 100%)',
        primaryBg: 'hsl(var(--swpr-background) / 100%)',
        black: 'hsl(var(--swpr-black) / 100%)',
        buttonColor: 'hsl(var(--swpr-button) / 100%)',
        buttonBgColor: 'hsl(var(--swpr-button-bg) / 100%)',
        buttonBorderColor: 'hsl(var(--swpr-button-border) / 100%)',
        buttonHoverColor: 'hsl(var(--swpr-button-hover) / 100%)',
        buttonHoverBgColor: 'hsl(var(--swpr-button-hover-bg) / 100%)',
        buttonActiveColor: 'hsl(var(--swpr-button-active) / 100%)',
        buttonActiveBgColor: 'hsl(var(--swpr-button-active-bg) / 100%)',
        danger: 'hsl(var(--swpr-danger) / 100%)',
        error: 'hsl(var(--swpr-error) / 100%)',
        grey: 'hsl(var(--swpr-grey) / 100%)',
        'light-grey': 'hsl(var(--swpr-light-grey) / 100%)',
        lightest: 'hsl(var(--swpr-background) / 100%)',
        'near-black': 'hsl(var(--swpr-near-black) / 100%)',
        success: 'hsl(var(--swpr-success) / 100%)',
        warning: 'hsl(var(--swpr-warning) / 100%)',
        white: 'hsl(var(--swpr-white) / 100%)',
        light: 'hsl(var(--swpr-light-grey) / 100%)',
        dark: 'hsl(var(--swpr-near-black) / 100%)',
        'swdc-surface-black': 'hsl(var(--swdc-surface-black) / 100%)',
        'swdc-surface-white': 'hsl(var(--swdc-surface-white) / 100%)',
        'swdc-surface-pure-white': 'hsl(var(--swdc-surface-pure-white) / 100%)',
        'swdc-surface-pure-white-half': 'hsl(var(--swdc-surface-pure-white-half) / 100%)',
        'swdc-error-25': 'hsl(var(--swdc-error-25) / 100%)',
        'swdc-error-85': 'hsl(var(--swdc-error-85) / 100%)',
        'swdc-alert-25': 'hsl(var(--swdc-alert-25) / 100%)',
        'swdc-alert-90': 'hsl(var(--swdc-alert-90) / 100%)',
        'swdc-affirm-35': 'hsl(var(--swdc-affirm-35) / 100%)',
        'swdc-affirm-50': 'hsl(var(--swdc-affirm-50) / 100%)',
        'swdc-affirm-85': 'hsl(var(--swdc-affirm-85) / 100%)',
        'swdc-info-25': 'hsl(var(--swdc-info-25) / 100%)',
        'swdc-info-50': 'hsl(var(--swdc-info-50) / 100%)',
        'swdc-info-85': 'hsl(var(--swdc-info-85) / 100%)'
      },
      fontFamily: {
        title: 'var(--prism-typography-title-font-style)'
      },
      fontSize: {
        'xxs-tight': ['.625rem', '1'],
        'xs-tight': ['.75rem', '1'],
        'sm-tight': ['.875rem', '1'],
        'base-tight': ['1rem', '1'],
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
