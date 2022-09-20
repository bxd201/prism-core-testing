// @flow
import { varValues } from 'src/shared/withBuild/variableDefs'

type UseChipMaximizerProps = {
  isMaximized: boolean,
  isDark: boolean
}

type UseChipMaximizerObj = {
  contrastingTextColor: string,
  styles: {
    chip: string,
    wrapper: string,
    swatch: string,
    alt: string
  }
}

export const BASE_CLASS = 'color-info'

const useChipMaximizer = ({ isMaximized, isDark }: UseChipMaximizerProps): UseChipMaximizerObj => {
  const styles = {
    chip: ['__max-chip'],
    wrapper: ['__display-toggles-wrapper', '__display-toggles-wrapper--swatch-size'],
    swatch: ['__display-toggle-button', '__swatch-size-toggle-button'],
    alt: ['__display-toggle-button', '__swatch-size-toggle-button', '__display-toggle-button--alt']
  }

  const maximizedStyles = ['maximized', 'chip-maximized', 'active', 'active']
  const darkStyles = ['dark-color', 'dark-color', 'dark-color', 'dark-color']

  const addStylesModifiers = (styles) => {
    let generatedStyles = {}

    Object.keys(styles).map((key, index) => {
      if (isMaximized) {
        styles[key] = [...styles[key], `${styles[key][0]}--${maximizedStyles[index]}`]
      }

      if (isDark) {
        styles[key] = [...styles[key], `${styles[key][0]}--${darkStyles[index]}`]
      }

      generatedStyles[key] = styles[key].map((styleClass) => `${BASE_CLASS}${styleClass}`).join(' ')
    })

    return generatedStyles
  }

  return {
    contrastingTextColor: isDark ? varValues._colors.white : varValues._colors.black,
    styles: addStylesModifiers(styles)
  }
}

export default useChipMaximizer
