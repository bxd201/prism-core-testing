// @flow
import React, { useState, useEffect } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import type { Scene } from '../../shared/types/Scene'
import type { Color } from '../../shared/types/Colors'
import TintableSceneSurface from '../SceneManager/TintableSceneSurface'
import TintableSceneSVGDefs from '../SceneManager/TintableSceneSVGDefs'
import ensureFullyQualifiedAssetUrl from '../../shared/utils/ensureFullyQualifiedAssetUrl.util'
import { LiveMessage } from 'react-aria-live'
import { getFilterId, getMaskId } from '../../shared/utils/tintableSceneUtils'
import uniqueId from 'lodash/uniqueId'
import uniq from 'lodash/uniq'
import concat from 'lodash/concat'
import without from 'lodash/without'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'
import { baseClassName, getTintColorBySurface, transitionClassName } from '../SceneManager/TintableScene'
import SimpleTintableSceneHitArea from './SimpleTintableSceneHitArea'
type SimpleTintableSceneProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  scene?: Scene,
  sceneId?: number,
  sceneType: string,
  sceneName: string,
  background: string,
  surfaceUrls: string[],
  surfaceIds: number[],
  surfaceHitAreas: string[],
  highlights?: any[],
  shadows?: any[],
  colors: Color[],
  width: number,
  height: number,
  imageValueCurve?: any,
  isUsingWorkspace: boolean,
  activeColorId?: string,
  interactive?: boolean,
  onUpdateColor?: Function,
  updateCurrentSceneInfo?: Function,
  allowEdit?: boolean
}

export const reorderColors = (colors: Color[], activeColorId?: string) => {
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

// @todo deprecate the workspace should be adapted to the array based surface model higher up and passed as props to simple tintablescene -RS
const getTintColorBySurfaceAdapter = (isUsingWorkspace: boolean, surface: any, surfaceIndex: number, colors: Color[], activeColorId?: string) => {
  if (isUsingWorkspace) {
    const colours = reorderColors(colors, activeColorId)
    return colours[surfaceIndex]
  }

  // @todo, this is a stub it needs to be completely implemented to use -RS
  return getTintColorBySurface(surface)
}

const simpleTintableClassName = 'simple-tintable'

const SimpleTintableScene = (props: SimpleTintableSceneProps) => {
  // @todo the scene prop is here for posterity, this component can be used as an adapter -RS
  const { sceneType, background, sceneName, width, height, imageValueCurve, surfaceUrls, isUsingWorkspace, surfaceIds, highlights, shadows, colors, activeColorId, sceneId, surfaceHitAreas, interactive, onUpdateColor, updateCurrentSceneInfo, allowEdit } = props
  const activeColor = colors.filter((color) => color.id === activeColorId)[0]
  const [instanceId] = useState(uniqueId('TS'))
  const [activePreviewSurfaces, setActivePreviewSurfaces] = useState([])
  const [hitAreaLoadingCount, setHitAreaLoadingCount] = useState(0)
  const [hitAreaError, setHitAreaError] = useState(false)
  const [hitAreaLoaded, setHitAreaLoaded] = useState(props.surfaceUrls.length === 0)

  useEffect(() => setHitAreaLoadingCount(surfaceHitAreas && surfaceHitAreas.length - 1), surfaceHitAreas)

  const handleColorDrop = (surfaceId: string, color: Color) => {
    setActivePreviewSurfaces([])
    onUpdateColor && onUpdateColor(sceneId, surfaceId, color)
  }
  const handleOver = (surfaceId: string) => { setActivePreviewSurfaces(uniq(concat(activePreviewSurfaces, surfaceId))) }
  const handleOut = (surfaceId: string) => { setActivePreviewSurfaces(without(activePreviewSurfaces, surfaceId)) }
  const handleHitAreaLoadingSuccess = () => {
    setHitAreaLoadingCount(hitAreaLoadingCount + 1)
    if (hitAreaLoadingCount <= 0) {
      setHitAreaLoaded(true)
    }
  }
  const handleHitAreaLoadingError = () => { setHitAreaError(true) }
  const handleClickSurface = (surfaceId: string) => {
    if (updateCurrentSceneInfo && allowEdit) {
      updateCurrentSceneInfo(sceneId, surfaceId)
      return
    }
    if (activeColor) {
      updateSurfaceColor(surfaceId, activeColor)
    }
  }
  const updateSurfaceColor = (surfaceId: string, color: Color) => {
    props.onUpdateColor && props.onUpdateColor(props.sceneId, surfaceId, color)
  }

  return (
    <>
      <div style={{ width, height }} className={`${simpleTintableClassName}-wrapper`}>
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
                    scaleSvg
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

      {interactive && (
        <div className={`${baseClassName}__hit-wrapper`}>
          {surfaceHitAreas && surfaceHitAreas.map((surface, i) => (
            <SimpleTintableSceneHitArea
              key={surfaceIds[i]}
              onDrop={handleColorDrop}
              onOver={handleOver}
              onOut={handleOut}
              onLoadingSuccess={handleHitAreaLoadingSuccess}
              onLoadingError={handleHitAreaLoadingError}
              interactionHandler={() => handleClickSurface(surfaceIds[i])}
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
