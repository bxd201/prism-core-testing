// EXAMPLE IMPORT: import ProcessColorsWorker from 'worker-loader?inline=true&fallback=false!./workers/processColorPayload.worker'
/* eslint-disable */
/* global self, postMessage */
// @flow
import { convertCategorizedColorsToClasses, convertCategorizedColorsToColorMap } from '../../../shared/helpers/ColorDataUtils'

self.addEventListener('message', (e: any) => { // eslint-disable-line no-restricted-globals
  if (!e || !e.data) return

  const { data: { brights, colors } } = e

  const convertedColors = convertCategorizedColorsToClasses(colors)
  const convertedBrights = convertCategorizedColorsToClasses(brights)
  const colorMap = { ...convertCategorizedColorsToColorMap(convertedColors), ...convertCategorizedColorsToColorMap(convertedBrights) }

  postMessage({
    colors: convertedColors,
    brights: convertedBrights,
    colorMap
  })
})
