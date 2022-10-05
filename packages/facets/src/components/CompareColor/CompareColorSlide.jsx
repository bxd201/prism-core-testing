// @flow
import type { Node } from 'react'
import React from 'react'
import { fullColorNumber, getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import type { Color } from '../../shared/types/Colors.js.flow'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import * as style from './constants'

type CompareColorSlideProps = {
  color: Color,
  colorInfoClass: string,
  colorNumOnBottom: boolean,
  colorsForView: Array<Color | null>,
  curr: number,
  selectedScene: FlatScene | void,
  selectedSceneUid: string,
  selectedVariant: FlatVariant | void
}

const CompareColorSlide = ({
  color,
  colorInfoClass,
  colorNumOnBottom,
  colorsForView,
  curr,
  selectedScene,
  selectedSceneUid,
  selectedVariant
}: CompareColorSlideProps): Node => {
  return (
    <div
      style={{ backgroundColor: color.hex, transform: `translateX(-${curr * 100}%)` }}
      className={`${style.queueWrapperClass}`}
    >
      <div className={`${style.backgroundColorClass}`} />
      <SingleTintableSceneView
        surfaceColorsFromParents={colorsForView}
        selectedSceneUid={selectedSceneUid}
        scenesCollection={[selectedScene]}
        variantsCollection={[selectedVariant]}
      />
      <div
        style={{ color: getContrastYIQ(color.hex) }}
        className={`${colorInfoClass}${colorNumOnBottom ? '__name-number' : ''}`}
      >
        <span className={`${colorInfoClass}__number`}>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
        <span className={`${colorInfoClass}__name`}>{color.name}</span>
      </div>
    </div>
  )
}

export default CompareColorSlide
