// @flow
import React, { useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import type { Scene } from '../../shared/types/Scene'
import type { Color } from '../../shared/types/Colors'
import TintableSceneSurface from './TintableSceneSurface'
import TintableSceneSVGDefs from './TintableSceneSVGDefs'
import ensureFullyQualifiedAssetUrl from '../../shared/utils/ensureFullyQualifiedAssetUrl.util'
import { LiveMessage } from 'react-aria-live'
import { getFilterId, getMaskId } from '../../shared/utils/tintableSceneUtils'
import uniqueId from 'lodash/uniqueId'
import { baseClassName, getTintColorBySurface, transitionClassName } from './TintableScene'

type SimpleTintableSceneProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  scene?: Scene,
  sceneType: string,
  sceneName: string,
  background: string,
  surfaceUrls: string[],
  surfaceIds: number[],
  highlights?: any[],
  shadows?: any[],
  colors: Color[],
  width: number,
  height: number,
  imageValueCurve?: any,
  isUsingWorkspace: boolean,
  activeColorId?: string
}

const reorderColors = (colors: Color[], activeColorId?: string) => {
  return colors.map((color, i) => {
    if (i === 0 && activeColorId) {
      return colors.find(c => c.id === activeColorId)
    } else if (color.id !== activeColorId) {
      return color
    } else {
      return null
    }
  }).filter(item => !!item)
}

const getTintColorBySurfaceAdapter = (isUsingWorkspace: boolean, surface: any, surfaceIndex: number, colors: Color[], activeColorId?: string) => {
  if (isUsingWorkspace) {
    const colours = reorderColors(colors, activeColorId)
    return colours[surfaceIndex]
  }

  // @todo, this is a stub it needs to be completely implemented to use -RS
  return getTintColorBySurface(surface)
}

const SimpleTintableScene = (props: SimpleTintableSceneProps) => {
  // @todo the scene prop is here for posterity, this component can be used as an adapter -RS
  const { sceneType, background, sceneName, width, height, imageValueCurve, surfaceUrls, isUsingWorkspace, surfaceIds, highlights, shadows, colors, activeColorId } = props
  const [instanceId] = useState(uniqueId('TS'))

  return (
    <>
      <div className={`${baseClassName}__tint-wrapper`}>
        <img className={`${baseClassName}__natural`} src={background} alt={sceneName} />
        <TransitionGroup className={`${transitionClassName}__colors`}>
          {surfaceUrls.map((surface: string, i) => {
            const highlight: ?string = highlights && surfaceUrls.length === highlights.length ? highlights[i] : null
            const shadow: ?string = shadows && surfaceUrls.length === shadows.length ? shadows[i] : null
            const tintColor: ?Color = getTintColorBySurfaceAdapter(isUsingWorkspace, surface, i, colors, activeColorId)
            if (tintColor) {
              return (
                <CSSTransition
                  key={`${surfaceIds[i]}_${tintColor.hex}`}
                  timeout={1}
                  mountOnEnter
                  classNames={`${transitionClassName}__colors__color-`} >
                  <TintableSceneSurface
                    type={sceneType}
                    image={background}
                    width={width}
                    height={height}
                    maskId={getMaskId(instanceId, surfaceIds[i], tintColor.hex)}
                    filterId={getFilterId(instanceId, surfaceIds[i], tintColor.hex)} >
                    <TintableSceneSVGDefs
                      type={sceneType}
                      width={width}
                      height={height}
                      highlightMap={highlight ? ensureFullyQualifiedAssetUrl(highlight) : void (0)}
                      shadowMap={shadow ? ensureFullyQualifiedAssetUrl(shadow) : void (0)}
                      filterId={getFilterId(instanceId, surfaceIds[i], tintColor.hex)}
                      filterColor={tintColor.hex}
                      filterImageValueCurve={imageValueCurve}
                      maskId={getMaskId(instanceId, surfaceIds[i], tintColor.hex)}
                      maskImage={surface} />
                  </TintableSceneSurface>
                </CSSTransition>
              )
            }
          })}
        </TransitionGroup>
      </div>

      {sceneName && (<LiveMessage message={`${sceneName} scene has been loaded`} aria-live='polite' />)}
    </>
  )
}

export default SimpleTintableScene
