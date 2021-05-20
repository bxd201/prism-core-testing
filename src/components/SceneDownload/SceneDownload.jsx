// @flow strict
import React, { useState, useCallback } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import Jimp from 'jimp'
import { generateImage } from '../../shared/services/sceneDownload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ACTIVE_SCENE_LABELS_ENUM } from '../../store/actions/navigation'
import type { FlatVariant, MiniColor } from '../../shared/types/Scene'

type Props = {
  buttonCaption: string,
  activeComponent: string,
  getFlatImage: Function,
  config: object,
  selectedSceneUid: string | null,
  variantsCollection: FlatVariant[],
  selectedVariantName: string,
  surfaceColors: MiniColor[]
}

const PAINT_SCENE_COMPONENT = ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE
const BACKGROUND_IMG = 'paint-scene-canvas-first'
const PAINT_LAYER = 'paint-scene-canvas-second'

export default (props: Props) => {
  const [isCreatingDownload, setIsCreatingDownload] = useState(false)
  const [finalImageUrl, setFinalImageUrl] = useState()
  const { buttonCaption, activeComponent, getFlatImage, config, variantsCollection, selectedSceneUid, selectedVariantName, surfaceColors } = props
  const intl = useIntl()

  const downloadLinkRef = useCallback(link => {
    if (link !== null) {
      link.click()
      setFinalImageUrl(null)
    }
  })

  const onDownloadClick = async () => {
    setIsCreatingDownload(true)
    let imageSrc = ''
    if (activeComponent === PAINT_SCENE_COMPONENT) {
      const backgroundImg = document.getElementsByName(BACKGROUND_IMG)[0].getContext('2d')
      const paintLayer = document.getElementsByName(PAINT_LAYER)[0].getContext('2d')
      await getFlatImage(backgroundImg, paintLayer).then((url) => { imageSrc = url })
    }
    const variant = variantsCollection.find(variant => variant.sceneUid === selectedSceneUid && variant.variantName === selectedVariantName)
    const data = activeComponent === PAINT_SCENE_COMPONENT ? imageSrc : variant
    generateImage(data, surfaceColors, config, intl).then(image => image.getBufferAsync(Jimp.MIME_JPEG))
      .then(buffer => {
        const blob = new Blob([buffer], { type: 'img/jpg' })
        const urlCreator = window.URL || window.webkitURL
        const imgUrl = urlCreator.createObjectURL(blob)
        setFinalImageUrl(imgUrl)
        setIsCreatingDownload(false)
        // $FlowIgnore
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, 'download.jpg')
        }
      })
  }

  return (
    <ul>
      {!isCreatingDownload && <li style={{ display: 'inline-block', verticalAlign: 'top' }}>
        <ul>
          <button
            onClick={onDownloadClick}
            disabled={isCreatingDownload}
            style={{ flexDirection: 'column' }}
          >
            <div className='save-options__items'>
              <div>
                <FontAwesomeIcon
                  title={intl.formatMessage({ id: 'DOWNLOAD_MASK' })}
                  icon={['fal', 'download']}
                  size='2x' />
              </div>
              <div>
                <FormattedMessage id={buttonCaption} />
              </div>
            </div>
          </button>
        </ul>
      </li>}
      {isCreatingDownload && (
        <li style={{ display: 'inline-block' }}>
          <CircleLoader color='#0069af' />
        </li>
      )}
      {/* $FlowIgnore */}
      {!isCreatingDownload && finalImageUrl && !navigator.msSaveBlob && (
        <li style={{ display: 'inline-block' }}>
          <a href={`${finalImageUrl}`} download='SceneImage.jpg' ref={downloadLinkRef} hidden>Click to download</a>
        </li>
      )}
    </ul>
  )
}
