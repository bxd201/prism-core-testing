import React, { SyntheticEvent } from 'react'

export interface ImageQueueProps {
  dataUrls: string[]
  addToQueue: (image: SyntheticEvent, i: number) => void
}

const ImageQueue = (props: ImageQueueProps): JSX.Element => {
  const mapImages = (dataUrls): HTMLImageElement[] => {
    return dataUrls.map((dataUrl, i: number) => {
      return (
        <img
          aria-hidden='true'
          crossOrigin={'anonymous'}
          src={dataUrl}
          key={`${i}`}
          id={`${i}`}
          className='invisible hidden'
          alt=''
          onLoad={(e) => props.addToQueue(e, i)}
        />
      )
    })
  }

  return <>{mapImages(props.dataUrls)}</>
}

export default ImageQueue
