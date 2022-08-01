// @flow
import type { ColorMap } from 'src/shared/types/Colors.js.flow'

export const checkCanMergeColors = (currentColors: Object[], newColors: Object[], max: number) => {
  const emptySlots = max - currentColors.length
  const dupeCount = getDupeColorCount(currentColors, newColors)
  const additions = newColors.length - dupeCount

  // new colors don't exist in the current colors
  if (additions === newColors.length) {
    return emptySlots > 0 && emptySlots >= newColors.length
  }

  // Some new colors exist in the current colors
  return emptySlots >= additions
}

// This method is purely for semantics to make the logic easier to read (it fixes a would be double negative)
export const shouldPromptToReplacePalette = (currentColors: Object[], newColors: Object[], max: number) => {
  const willFit = checkCanMergeColors(currentColors, newColors, max)
  const dupeCount = getDupeColorCount(currentColors, newColors)
  // The would be imported palette already exists in totality within the current colors, don't prompt
  if (dupeCount && dupeCount === newColors.length) {
    return false
  }

  return !willFit
}

export const getDupeColorCount = (currentColors: Object[], newColors: Object[]) => {
  let dupeCount = 0

  newColors && newColors.forEach(newColor => {
    currentColors.some(oldColor => {
      if (oldColor.id === newColor.id) {
        dupeCount++
        return true
      }
    })
  })

  return dupeCount
}

export const getColorInstances = (colors: Array<Object>, livePaletteColorsIdArray: Array<string>, colorMap: ColorMap) => {
  const uniqueColorIdsWithSavedLivePalette = new Set()
  colors && colors.filter(color => color).map(color => {
    uniqueColorIdsWithSavedLivePalette.add(color.id)
  })
  livePaletteColorsIdArray && livePaletteColorsIdArray.map(colorId => {
    uniqueColorIdsWithSavedLivePalette.add(colorId)
  })
  const colorInstances = []
  for (const colorId of uniqueColorIdsWithSavedLivePalette) {
    if (colorMap && colorMap[colorId]) {
      colorInstances.push(colorMap[colorId])
    }
  }
  return colorInstances
}
