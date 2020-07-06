// @flow
import React, { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl, FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'
import MergeCanvas from '../../MergeCanvas/MergeCanvas'
import { mouseDownPreventDefault } from 'src/shared/helpers/MiscUtils'
import type { Scene, SceneStatus } from 'src/shared/types/Scene'
import { StaticTintScene } from '../../CompareColor/StaticTintScene'
import { replaceSceneStatus } from '../../../shared/utils/sceneUtil'
import { SCENE_VARIANTS } from 'constants/globals'
import { hideWarningModal } from 'src/store/actions/scenes'

export default () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const history = useHistory()
  const showing: boolean = useSelector(store => store.scenes.warningModal.showing)
  const openFn: () => void = useSelector(store => store.scenes.warningModal.openFn)
  let miniImage: ?{} = useSelector(store => store.scenes.warningModal.miniImg)

  const { scenes, sceneStatus, activeScenes }: { scenes: Scene[], sceneStatus: SceneStatus[], activeScenes: number[] } = useSelector(store => {
    const currentSceneData: ?SceneStatus = store.scenes && store.scenes.sceneStatus[store.scenes.type] && store.scenes.sceneStatus[store.scenes.type].find(item => item.id === store.scenes.activeScenes[0])
    const sceneSurfaceTinted = currentSceneData && currentSceneData.surfaces.find(surface => !!surface.color)
    const scenes: Scene = store.selectedSceneStatus && !store.selectedSceneStatus.openUnpaintedStockScene && sceneSurfaceTinted !== void 0 ? replaceSceneStatus(store.scenes, store.selectedSceneStatus) : store.scenes
    return {
      scenes: scenes.sceneCollection[store.scenes.type],
      sceneStatus: scenes.sceneStatus[store.scenes.type],
      activeScenes: scenes.activeScenes
    }
  })

  if (miniImage === undefined) {
    const currentSceneData: ?SceneStatus = sceneStatus && sceneStatus.find(item => item.id === activeScenes[0])
    const currentSceneMetaData: ?Scene = scenes && scenes.find(scene => scene.id === activeScenes[0])
    currentSceneMetaData && currentSceneData && (miniImage =
      <StaticTintScene scene={currentSceneMetaData} statuses={currentSceneData.surfaces} config={{ isNightScene: currentSceneData.variant === SCENE_VARIANTS.NIGHT }} />
    )
  }

  const canvasRef = useRef()

  const applyZoomPan = (ref: any) => {
    if (ref && ref.current) {
      ref.current.style = 'width: 120px'
    }
  }

  return showing && (
    <>
      <div className='cvw__modal__overlay' />
      <div className='cvw__modal' role='presentation' onMouseDown={mouseDownPreventDefault}>
        <div className='cvw__modal__title'>{intl.messages['CVW.WARNING_REPLACEMENT']}</div>
        {miniImage && !miniImage.dataUrls ? <div className='cvw__modal__mini-image'>{miniImage}</div> : null}
        {miniImage && miniImage.dataUrls && (
          <div className='cvw__modal__mini-image'>
            <MergeCanvas
              ref={canvasRef}
              applyZoomPan={applyZoomPan}
              layers={miniImage.dataUrls}
              width={miniImage.width}
              height={miniImage.height}
              colorOpacity={0.8}
            />
          </div>
        )}
        <div className='cvw__modal__action-wrapper'>
          <button
            className='cvw__modal__action-btn'
            onClick={() => {
              dispatch(hideWarningModal())
              openFn()
              history.push('/active')
            }}
          >
            <FormattedMessage id='YES' />
          </button>
          <button className='cvw__modal__action-btn' onClick={() => dispatch(hideWarningModal())}>
            <FormattedMessage id='NO' />
          </button>
        </div>
      </div>
    </>
  )
}
