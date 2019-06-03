module.exports.varValues = {
  base: '16px',
  spacing: '1rem',
  corner: '2px',
  breakpoints: {
    xs: '576px', /* 576px */
    sm: '768px', /* 768px */
    md: '992px', /* 992px */
    lg: '1200px' /* 1200px */
  },
  typography: {
    font: '\'Open Sans\', sans-serif',
    text: '1rem',
    title: '2rem'
  },
  colors: {
    primary: '#0069af',
    secondary: '#4f5967',
    warning: '#f2c500',
    success: '#1fce6d',
    danger: '#e94b35',
    error: '#e94b35',
    grey: '#cccccc',
    lightGrey: '#dddddd',
    nearBlack: '#2e2e2e',
    black: '#000000',
    white: '#ffffff',
    swBlue: '#0069af',
    summerSkyBlue: '#2cabe2'
  },
  colorWall: {
    swatchColumns: 56, // default SW color chunks
    exitTransitionMS: 200,
    enterTransitionMS: 300,
    swatchActivateDurationMS: 200,
    swatchActivateDelayMS: 0,
    swatchDeactivateDurationMS: 200,
    swatchDeactivateDelayMS: 0,
    transitionTime: 700 // this value is halved in CSS to reduce initial judder caused by component rendering
  },
  slick: {
    mobile: 576,
    tablet: 768,
    xs: 1,
    sm: 4,
    lg: 8
  },
  scenes: {
    hitAreaOutlineColor: '255, 0, 255', // RGB value of hit area outline (must be RGB, not hex)
    tintTransitionTime: 250
  }
}

module.exports.varNames = {
  theme: {
    colors: {
      primary: '--prism-color-primary',
      secondary: '--prism-color-secondary',
      warning: '--prism-color-warning',
      success: '--prism-color-success',
      danger: '--prism-color-danger',
      error: '--prism-color-error',
      grey: '--prism-color-grey',
      lightGrey: '--prism-color-lightGrey',
      nearBlack: '--prism-color-nearBlack',
      black: '--prism-color-black',
      white: '--prism-color-white',
      summerSkyBlue: '--prism-color-summerSkyBlue'
    }
  },
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
