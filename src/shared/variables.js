module.exports.varValues = {
  base: '16px',
  spacing: '1rem',
  corner: '2px',
  breakpoints: {
    xs: '36em', /* 576px */
    sm: '48em', /* 768px */
    md: '62em', /* 992px */
    lg: '75em' /* 1200px */
  },
  typography: {
    font: '\'Open Sans\', sans-serif',
    text: '1rem',
    title: '2rem'
  },
  colors: {
    primary: '#004b84',
    secondary: '#4f5967',
    warning: '#f2c500',
    success: '#1fce6d',
    danger: '#e94b35',
    error: '#e94b35',
    grey: '#cccccc',
    nearBlack: '#2e2e2e',
    black: '#000000',
    white: '#ffffff',
    swBlue: '#2c97de'
  },
  colorWall: {
    swatchColumns: 56, // default SW color chunks
    exitTransitionMS: 200,
    enterTransitionMS: 300,
    swatchActivateDurationMS: 200,
    swatchActivateDelayMS: 0,
    swatchDeactivateDurationMS: 200,
    swatchDeactivateDelayMS: 0
  },
  scenes: {
    hitAreaOutlineColor: '255, 0, 255' // RGB value of hit area outline (must be RGB, not hex)
  }
}

module.exports.varNames = {
  globalCornerRadius: '--sw-global-corner-radius',
  globalSwatchSpacing: '--sw-global-swatch-spacing',
  typography: {
    globalFontSize: '--sw-global-font-size'
  },
  scenes: {
    hitAreaOutlineColor: '--prism-hit-area-outline-color',
    buttons: {
      colors: {
        default: '--scene-button-default-color',
        active: '--scene-button-active-color'
      }
    }
  }
}
