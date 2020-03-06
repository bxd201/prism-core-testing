// @flow strict
import React, { useState, useCallback } from 'react'
import ButtonBar from '../GeneralButtons/ButtonBar/ButtonBar'
import { FormattedMessage } from 'react-intl'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import type { Color } from '../../shared/types/Colors'
import Jimp from 'jimp'
import type { SceneInfo } from '../../shared/types/Scene'
import { generateImage } from '../../shared/services/sceneDownload'

type Props = {
  buttonCaption: string,
  sceneInfo: void | SceneInfo,
  colors: Color[]
}

export default (props: Props) => {
  const [isCreatingDownload, setIsCreatingDownload] = useState(false)
  const [finalImageUrl, setFinalImageUrl] = useState()
  const { buttonCaption, sceneInfo, colors } = props

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
      <li style={{ display: 'inline-block', verticalAlign: 'top' }}>
        <ul>
          <ButtonBar.Button
            onClick={onDownloadClick}
            disabled={isCreatingDownload || colors.length < 1}
          >
            <FormattedMessage id={buttonCaption} />
          </ButtonBar.Button>
        </ul>
      </li>
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
