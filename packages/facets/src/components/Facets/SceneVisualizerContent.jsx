// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'

import './SceneVisualizerFacet.scss'
import AEMUploadIcon from '../Iconography/AEMUploadIcon'

const FACET_CLASS_BASE = 'scene-visualizer'
const SCENE_BTN_WRAPPER = `${FACET_CLASS_BASE}__btn-wrapper`
const SCENE_BTN_WRAPPER_BTN = `${SCENE_BTN_WRAPPER}__btn`
const SCENE_BTN_WRAPPER_BTN_ICON = `${SCENE_BTN_WRAPPER_BTN}__icon`
const FAST_MASK_WRAPPER = `${FACET_CLASS_BASE}__fastmask-wrapper`
const FAST_MASK_CLOSE_BTN = `${FAST_MASK_WRAPPER}__close-btn`
const CUSTOM_ICON = `${SCENE_BTN_WRAPPER_BTN}__custom-icon`
const ICON_SVG = `${CUSTOM_ICON}__svg`

type SceneVisualizerContentProps = {
  tinterRendered: boolean,
  handleFastMaskClose?: Function,
  initUpload: Function,
  uploadInitiated: boolean,
  tinter: any,
  uploadButtonText?: string
}

const SceneVisualizerContent = (props: SceneVisualizerContentProps) => {
  const { tinterRendered, handleFastMaskClose, initUpload, uploadInitiated, tinter, uploadButtonText } = props

  return (
    <>
      <div className={FAST_MASK_WRAPPER}>
        {tinter}
        {tinterRendered && handleFastMaskClose ? (
          <div className={FAST_MASK_CLOSE_BTN}>
            <button onClick={handleFastMaskClose}>
              <FontAwesomeIcon className={SCENE_BTN_WRAPPER_BTN_ICON} icon={['fal', 'times']} size='2x' />
            </button>
          </div>
        ) : null}
        {tinterRendered ? (
          <div className={SCENE_BTN_WRAPPER}>
            <button onClick={initUpload} className={SCENE_BTN_WRAPPER_BTN} disabled={uploadInitiated}>
              {uploadButtonText ? (
                <div className={CUSTOM_ICON}>
                  <AEMUploadIcon />
                </div>
              ) : (
                <FontAwesomeIcon className={SCENE_BTN_WRAPPER_BTN_ICON} icon={['fal', 'upload']} size='1x' />
              )}
              {uploadButtonText ? (
                <div>{uploadButtonText}</div>
              ) : (
                <FormattedMessage id='SCENE_VISUALIZER.UPLOAD_PHOTO' />
              )}
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default SceneVisualizerContent
