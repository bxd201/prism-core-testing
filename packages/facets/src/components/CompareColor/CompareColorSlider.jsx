// @flow
import type { Node } from 'react'
import React from 'react'
import type { Color } from '../../shared/types/Colors.js.flow'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'
import { createMiniColorFromColor } from '../SingleTintableSceneView/util'
import CompareColorSlide from './CompareColorSlide'

type CompareColorSliderProps = {
  colorIds: string[],
  colorInfoClass: string,
  colorNumOnBottom: boolean,
  colors: Color[],
  curr: number,
  scenesCollection: FlatScene[],
  selectedSceneUid: string,
  selectedVariantName: string,
  variantsCollection: FlatVariant[]
}

const CompareColorSlider = ({
  colorIds,
  colorInfoClass,
  colorNumOnBottom,
  colors,
  curr,
  scenesCollection,
  selectedSceneUid,
  selectedVariantName,
  variantsCollection
}: CompareColorSliderProps): Node | null => {
  const renderColors = colors.filter((color: Color) => {
    return !colorIds.includes(color.id)
  })

  if (!renderColors) return null

  return renderColors.map((color, index) => {
    const selectedVariant = variantsCollection.find(
      (variant) => variant.sceneUid === selectedSceneUid && variant.variantName === selectedVariantName
    )
    const selectedScene = scenesCollection.find((scene) => scene.uid === selectedSceneUid)
    const colorDataTemplate = selectedVariant?.surfaces.map((surface) => null)

    const fillFirstSurfaceColor = (template, color) => {
      const miniColor = createMiniColorFromColor(color)

      if (template) {
        return template.map((placeholder, i) => {
          return i ? null : miniColor
        })
      }

      return []
    }

    const colorsForView = fillFirstSurfaceColor(colorDataTemplate, color)

    return (
      <CompareColorSlide
        key={color.id}
        color={color}
        colorInfoClass={colorInfoClass}
        colorNumOnBottom={colorNumOnBottom}
        colorsForView={colorsForView}
        curr={curr}
        selectedScene={selectedScene}
        selectedSceneUid={selectedSceneUid}
        selectedVariant={selectedVariant}
      />
    )
  })
}

export default CompareColorSlider
