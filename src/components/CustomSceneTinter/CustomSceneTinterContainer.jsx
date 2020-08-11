// @flow
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from 'react'
import type { PaintSceneWorkspace } from '../../store/actions/paintScene'
import type { Color } from '../../shared/types/Colors'
import { FormattedMessage } from 'react-intl'
import SimpleTintableScene from '../SceneManager/SimpleTintableScene'
import { SCENE_TYPES } from '../../constants/globals'
import useColors from '../../shared/hooks/useColors'
import { useDispatch, useSelector } from 'react-redux'
import ImageQueue from '../MergeCanvas/ImageQueue'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'

import './CustomSceneTinter.scss'
import { setShowEditCustomScene } from '../../store/actions/scenes'
import { useHistory } from 'react-router-dom'

type CustomSceneTinterContainerProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  workspace: PaintSceneWorkspace,
  allowEdit: boolean
}

const customSceneTinterClass = 'custom-scene-tinter'
const customSceneTinterModalClass = `${customSceneTinterClass}__modal`
const customSceneTinterModalButtonClass = `${customSceneTinterModalClass}__btn`
const customSceneTinterModalTextClass = `${customSceneTinterModalClass}__text`

const CustomSceneTinterContainer = (props: CustomSceneTinterContainerProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const [imagesLoaded, setImagesLoaded] = useState(0)
  const showEditModal = useSelector((state) => state['showEditCustomScene'])
  const [colors] = useColors()
  const livePaletteColors = useSelector(state => state['lp'])
  const maskImageRef = useRef([])

  useEffect(() => {
    dispatch(setShowEditCustomScene(true))
  }, [])

  useEffect(() => {
    return function () {
      maskImageRef.current.length = 0
    }
  }, [maskImageRef])

  const { workspace, allowEdit } = props
  // eslint-disable-next-line no-unused-vars
  const { height, width, sceneName, layers, bgImageUrl: background, workspaceType, surfaces } = workspace
  const surfaceIds = surfaces.map((surface: string, i: number) => i)

  const handleSurfaceLoaded = (e, i) => {
    maskImageRef.current.push(e.target)
    setImagesLoaded(maskImageRef.current.length)
  }

  const getActiveColorId = (lpColor) => {
    if (lpColor && lpColor.activeColor) {
      return lpColor.activeColor.id
    }

    return null
  }

  const isReadyToTint = (imagesLoaded: number, livePaletteColors?: Color[], surfaces: string[]) => {
    return imagesLoaded && colors && livePaletteColors && livePaletteColors.colors.length && imagesLoaded === surfaces.length
  }

  const hideEditModal = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(setShowEditCustomScene(false))
  }

  const editMask = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(setShowEditCustomScene(false))
    history.push('/active/masking')
  }

  return (
    <>
      <ImageQueue dataUrls={surfaces} addToQueue={handleSurfaceLoaded} />
      <div className={customSceneTinterClass} style={{ width, height }} >
        { isReadyToTint(imagesLoaded, livePaletteColors, surfaces) ? <SimpleTintableScene
          colors={livePaletteColors.colors}
          activeColorId={getActiveColorId(livePaletteColors)}
          surfaceUrls={surfaces}
          surfaceIds={surfaceIds}
          width={width}
          allowEdit={allowEdit}
          height={height}
          sceneName={sceneName}
          sceneType={SCENE_TYPES.ROOM}
          background={background}
          isUsingWorkspace /> : <CircleLoader />}
        { isReadyToTint(imagesLoaded, livePaletteColors, surfaces) && allowEdit && showEditModal ? <div className={`${customSceneTinterModalClass}`}>
          <div className={customSceneTinterModalTextClass}>
            <FormattedMessage id={'SCENE_TINTER.FEEDBACK_MESSAGE'} />
            <button className={customSceneTinterModalButtonClass} onClick={editMask}>
              <FormattedMessage id={'SCENE_TINTER.FEEDBACK_CONFIRM'} />
            </button>
            <button className={customSceneTinterModalButtonClass} onClick={hideEditModal}>
              <FormattedMessage id={'SCENE_TINTER.FEEDBACK_CANCEL'} />
            </button>
          </div>
        </div> : null }
      </div>
    </>
  )
}

export default CustomSceneTinterContainer
