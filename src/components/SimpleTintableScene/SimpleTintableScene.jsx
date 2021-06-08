// @flow
import React, { useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import type { Scene } from '../../shared/types/Scene'
import type { Color } from '../../shared/types/Colors'
import TintableSceneSurface from './TintableSceneSurface'
import TintableSceneSVGDefs from './TintableSceneSVGDefs'
import { LiveMessage } from 'react-aria-live'
import { getFilterId, getMaskId } from '../../shared/utils/tintableSceneUtils'
import uniqueId from 'lodash/uniqueId'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'
import SimpleTintableSceneHitArea from './SimpleTintableSceneHitArea'

import './SimpleTintableScene.scss'

type SimpleTintableSceneProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  scene?: Scene,
  sceneType: string,
  sceneName: string,
  background: string,
  surfaceUrls: string[],
  surfaceIds: number[],
  surfaceHitAreas: string[],
  highlights?: any[],
  shadows?: any[],
  width: number,
  height: number,
  imageValueCurve?: any,
  interactive?: boolean,
  handleSurfaceInteraction?: Function,
  handleColorDrop?: Function,
  surfaceColors?: Color[]
}

const simpleTintableClassName = 'simple-tintable'

const SimpleTintableScene = (props: SimpleTintableSceneProps) => {
  const { sceneType, background, sceneName, width, height, imageValueCurve, surfaceUrls, surfaceIds, highlights, shadows, surfaceHitAreas, interactive, handleColorDrop, handleSurfaceInteraction, surfaceColors } = props
  const [instanceId] = useState(uniqueId('TS'))
  const [hitAreaLoadingCount, setHitAreaLoadingCount] = useState(0)
  const [hitAreaError, setHitAreaError] = useState(false)
  const [hitAreaLoaded, setHitAreaLoaded] = useState(props.surfaceUrls.length === 0)

  const handleHitAreaLoadingSuccess = () => {
    setHitAreaLoadingCount(hitAreaLoadingCount + 1)
    if (hitAreaLoadingCount <= 0) {
      setHitAreaLoaded(true)
    }
  }
  const handleHitAreaLoadingError = () => { setHitAreaError(true) }

  const handleClickSurface = (surfaceIndex: number) => {
    if (handleSurfaceInteraction) {
      handleSurfaceInteraction(surfaceIndex)
    }
  }

  return (
    <>
      {/* The transitions group will assume the calculated height of the ROOT DIV and not necessarily the specified height of the parent div */}
      <div className={`${simpleTintableClassName}-wrapper`}>
        <img className={`${simpleTintableClassName}__natural`} src={background} alt={sceneName} />
        <TransitionGroup className={`${simpleTintableClassName}__colors`}>
          {surfaceUrls.map((surface: string, i) => {
            const highlight: ?string = highlights && surfaceUrls.length === highlights.length ? highlights[i] : null
            const shadow: ?string = shadows && surfaceUrls.length === shadows.length ? shadows[i] : null
            const tintColor: ?Color = surfaceColors[i]
            if (tintColor) {
              return (
                <CSSTransition
                  key={`${
                    surfaceIds[i]}_${tintColor.hex}`}
                  timeout={1}
                  mountOnEnter
                  classNames={`${simpleTintableClassName}__colors__color-`} >
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
                      highlightMap={highlight || void (0)}
                      shadowMap={shadow || void (0)}
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

      {interactive && (
        <div className={`${simpleTintableClassName}__hit-wrapper`}>
          {surfaceHitAreas && surfaceHitAreas.map((surface, i) => (
            <SimpleTintableSceneHitArea
              key={surface}
              surfaceIndex={i}
              onDrop={handleColorDrop}
              onLoadingSuccess={handleHitAreaLoadingSuccess}
              onLoadingError={handleHitAreaLoadingError}
              interactionHandler={() => handleClickSurface(i)}
              svgSource={surface} />
          ))}
        </div>
      )}

      {hitAreaError ? (
        <GenericOverlay type={GenericOverlay.TYPES.ERROR} message='Error loading paintable surfaces' />
      ) : (interactive && !hitAreaLoaded) ? (
        <GenericOverlay type={GenericOverlay.TYPES.LOADING} />
      ) : null}

      {sceneName && (<LiveMessage message={`${sceneName} scene has been loaded`} aria-live='polite' />)}
    </>
  )
}

export default SimpleTintableScene
