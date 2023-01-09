// @flow
// This is a generic method that can map a color or color id (or anything else) to match the surfaces for a tintablescene
import type { FlatScene, FlatVariant } from '../types/Scene'

export const mapItemsToList = (item: any[], surfaces: any[]) => {
  return surfaces.map((surface, i) => {
    return i < item.length ? item[i] : null
  })
}

// @todo This is tech debt, we need a separate data source to handle this properly -RS
export const removeLastS = (text: string): string => {
  if (!text) {
    return ''
  }

  if (text.length > 2 && text.slice(-1).toLowerCase() === 's') {
    return text.slice(0, text.length - 1)
  }

  return text
}

export function getVariantDescription(
  sceneUid: string,
  variantName: string,
  scenes: FlatScene[],
  variants: FlatVariant[]
): string {
  if (sceneUid && scenes && variants) {
    const scene = scenes.find((item) => item.uid === sceneUid)
    if (scene) {
      const variantLabel = variantName || scene.variantNames.length ? scene.variantNames[0] : ''
      const variant = variants.find((item) => item.variantName === variantLabel && item.sceneUid === sceneUid)

      return variant?.description ?? ''
    }
  }

  return ''
}
