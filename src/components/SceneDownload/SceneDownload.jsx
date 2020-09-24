// @flow strict
import React, { useState, useCallback } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import Jimp from 'jimp'
import type { SceneInfo } from '../../shared/types/Scene'
import { generateImage } from '../../shared/services/sceneDownload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
  buttonCaption: string,
  sceneInfo: void | SceneInfo
}

export default (props: Props) => {
  const [isCreatingDownload, setIsCreatingDownload] = useState(false)
  const [finalImageUrl, setFinalImageUrl] = useState()
  const { buttonCaption, sceneInfo } = props
  const intl = useIntl()

  const downloadLinkRef = useCallback(link => {
    if (link !== null) {
      link.click()
      setFinalImageUrl(null)
    }
  })

  const onDownloadClick = () => {
    if (!sceneInfo) {
      return
    }

    setIsCreatingDownload(true)

    console.time('processing image')

    generateImage(sceneInfo).then(image => image.getBufferAsync(Jimp.MIME_JPEG))
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
        console.timeEnd('processing image')
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
          <a href={`${finalImageUrl}`} download='ColorSnapImage.jpg' ref={downloadLinkRef} hidden>Click to download</a>
        </li>
      )}
    </ul>
  )
}
