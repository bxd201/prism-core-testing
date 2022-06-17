import React, { useState } from 'react'
import { LiveMessage } from 'react-aria-live'
import uniqueId from 'lodash/uniqueId'
import { TransitionGroup } from 'react-transition-group'
import type { Color } from '../../interfaces/colors'
import TintableSceneSurface from './tintable-scene-surface'
import TintableSceneSVGDefs from './tintable-scene-svg-defs'
import SimpleTintableSceneHitArea from './simple-tintable-scene-hit-area'
import { getFilterId, getMaskId } from '../../utils/tintable-scene'
import GenericOverlay from '../generic-overlay/generic-overlay'
import InlineStyleTransition from '../inline-style-transition/inline-style-transition'
import { DndProvider } from 'react-dnd'

export interface SimpleTintableSceneProps {
  sceneType: string,
  sceneName: string,
  background: string,
  surfaceUrls: string[],
  surfaceIds: number[],
  surfaceHitAreas?: string[],
  highlights?: any[],
  shadows?: any[],
  width: number,
  height: number,
  imageValueCurve?: any,
  interactive?: boolean,
  handleSurfaceInteraction?: Function,
  handleColorDrop?: Function,
  surfaceColors?: Color[],
  adjustSvgHeight?: boolean,
  dndBackend?: any
}

const SimpleTintableScene = (props: SimpleTintableSceneProps): JSX.Element => {
  const {
    sceneType,
    background,
    sceneName,
    width,
    height,
    imageValueCurve,
    surfaceUrls,
    surfaceIds,
    highlights,
    shadows,
    surfaceHitAreas,
    interactive,
    handleColorDrop,
    handleSurfaceInteraction,
    surfaceColors,
    adjustSvgHeight,
    dndBackend
  } = props
  const [instanceId] = useState(uniqueId('TS'))
  const [hitAreaLoadingCount, setHitAreaLoadingCount] = useState(0)
  const [hitAreaError, setHitAreaError] = useState(false)
  const [hitAreaLoaded, setHitAreaLoaded] = useState(props.surfaceUrls.length === 0)

  const handleHitAreaLoadingSuccess = (): void => {
    setHitAreaLoadingCount(hitAreaLoadingCount + 1)
    if (hitAreaLoadingCount <= 0) {
      setHitAreaLoaded(true)
    }
  }
  const handleHitAreaLoadingError = (): void => { setHitAreaError(true) }

  const handleClickSurface = (surfaceIndex: number): void => {
    if (handleSurfaceInteraction) {
      handleSurfaceInteraction(surfaceIndex)
    }
  }

  return (
    <DndProvider backend={dndBackend}>
      {/* The transitions group will assume the calculated height of the ROOT DIV and not necessarily the specified height of the parent div */}
      <div>
        <img className={`block w-full relative h-auto`} src={background} alt={sceneName} />
        <TransitionGroup className={`absolute top-0 h-full w-full`}>
          {surfaceUrls.map((surface: string, i): JSX.Element => {
            const highlight: string = highlights && surfaceUrls.length === highlights.length ? highlights[i] : null
            const shadow: string = shadows && surfaceUrls.length === shadows.length ? shadows[i] : null
            const tintColor: Color = surfaceColors[i]
            if (tintColor) {
              return (
                <InlineStyleTransition
                  key={`${i}_tintable_surface`}
                  default={{
                    zIndex: 0,
                    opacity: 0,
                    transition: 'opacity 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                  entering={{
                    zIndex: 1,
                    opacity: 1,
                    backfaceVisibility: 'hidden',
                  }}
                  entered={{
                    zIndex: 1,
                    opacity: 1,
                    backfaceVisibility: 'unset',
                    transition: 'opacity 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 150ms'
                  }}
                  exiting={{
                    opacity: 0,
                    backfaceVisibility: 'hidden',
                  }}
                  exited={{
                    opacity: 0,
                    backfaceVisibility: 'hidden',
                  }}
                  timeout={1}>
                  <TintableSceneSurface
                    adjustSvgHeight={adjustSvgHeight}
                    type={sceneType}
                    image={background}
                    width={width}
                    height={height}
                    maskId={getMaskId(instanceId, surfaceIds[i], tintColor.hex)}
                    filterId={getFilterId(instanceId, surfaceIds[i], tintColor.hex)} >
                    <TintableSceneSVGDefs
                      type={sceneType}
                      highlightMap={highlight}
                      shadowMap={shadow}
                      filterId={getFilterId(instanceId, surfaceIds[i], tintColor.hex)}
                      filterColor={tintColor.hex}
                      filterImageValueCurve={imageValueCurve}
                      maskId={getMaskId(instanceId, surfaceIds[i], tintColor.hex)}
                      maskImage={surface} />
                  </TintableSceneSurface>
                </InlineStyleTransition>
              )
            }

            return null
          }) }
        </TransitionGroup>
      </div>

      {interactive && (
        <div className={`absolute left-0 top-0 w-full h-full`}>
          {surfaceHitAreas?.map((surface, i) => (
            // @ts-ignore
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
    </DndProvider>
  )
}

export default SimpleTintableScene
