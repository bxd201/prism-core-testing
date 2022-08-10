module.exports = {
  important: '.prism',
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
  theme: {
    fontFamily: {
      sans: "var(--prism-typography-body-font-family, 'Open Sans', sans-serif)"
    },
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        'fadeIn-1': 'fadeIn 1s ease-in-out',
        'delayedFadeIn': 'delayedFadeIn .2s ease-in-out'
      },
      backgroundPosition: {
        'bottom-0': '0 -100%',
        'bottom-20': '0 -80%'
      },
      borderWidth: {
        1: '1px'
      },
      colors: {
        primary: 'var(--prism-theme-color-primary, #0069af)',
        secondary: 'var(--prism-theme-color-secondary, #2CABE2)',
        primaryBg: 'var(--prism-theme-color-primary-bg, #fafafa)',
        black: 'var(--prism-theme-color-black, #000)',
        danger: 'var(--prism-theme-color-danger, #E94b35)',
        error: 'var(--prism-theme-color-error, #e94b35)',
        grey: 'var(--prism-theme-color-grey, #cccccc)',
        'light-grey': 'var(--prism-theme-color-light-grey, #dddddd)',
        lightest: 'var(--prism-theme-color-light-lightest, #fafafa)',
        'near-black': 'var(--prism-theme-color-near-black, #2e2e2e)',
        success: 'var(--prism-theme-color-success, #1fce6d)',
        warning: 'var(--prism-theme-color-warning, #f2c500)',
        white: 'var(--prism-theme-color-white, #FFF)',
        light: '#DDD',
        dark: '#2E2E2E'
      },
      fontSize: {
        '2xs': ['10px', '12px'],
        '1.5xs': ['.8125rem', '1.3125rem'],
        '2.5xl': ['1.7rem', '2.2rem']
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        delayedFadeIn: {
          '0%': { opacity: 0 },
          '25%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      },
      margin: {
        4.5: '1.125rem'
      },
      padding: {
        '2/4': '50%',
        '3/4': '75%'
      },
      screens: {
        xs: '475px'
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
