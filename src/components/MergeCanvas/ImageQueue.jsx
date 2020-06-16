// @flow
import React from 'react'
import { useIntl } from 'react-intl'

import './MergeCanvas.scss'

type ImageQueueProps = {
  dataUrls: string[],
  addToQueue: Function
}

const ImageQueue = (props: ImageQueueProps) => {
  const intl = useIntl()

  const mapImages = (dataUrls) => {
    return dataUrls.map((dataUrl, i) => {
      return <img
        src={dataUrl}
        key={`${i}`}
        id={`${i}`}
        className='merge-canvas-image-comp'
        alt={intl.formatMessage({ id: 'IMAGE_INVISIBLE' })}
        onLoad={(e) => props.addToQueue(e, i)}
      />
    })
  }

  return (
    <>
      {mapImages(props.dataUrls)}
    </>
  )
}

export default ImageQueue
