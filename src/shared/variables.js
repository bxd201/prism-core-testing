module.exports.varValues = {
  base: '16px',
  spacing: '1rem',
  corner: '2px',
  breakpoints: {
    xs: '0em' /* 0px */,
    sm: '30em' /* 480px */,
    md: '64em' /* 1024px */,
    lg: '75em' /* 1200px */
  },
  typography: {
    font: '\'Open Sans\', sans-serif',
    text: '1rem',
    title: '2rem'
  },
  colors: {
    primary: '#2c97de',
    secondary: '#7F8FA4',
    warning: '#f2c500',
    success: '#1fce6d',
    danger: '#e94b35',
    error: '#e94b35',
    grey: '#cccccc',
    white: '#ffffff'
  }
}

module.exports.varNames = {
  globalCornerRadius: '--sw-global-corner-radius',
  globalSwatchSpacing: '--sw-global-swatch-spacing',
  typography: {
    globalFontSize: '--sw-global-font-size'
  },
  scenes: {
    buttons: {
      colors: {
        default: '--scene-button-default-color',
        active: '--scene-button-active-color'
      }
    }
  }
}
