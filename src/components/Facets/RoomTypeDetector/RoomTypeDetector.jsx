// @flow
import React, { useState, useCallback, createContext, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import uniqueId from 'lodash/uniqueId'

import FileInput from '../../FileInput/FileInput'
import GenericOverlay from '../../Overlays/GenericOverlay/GenericOverlay'

import facetBinder from 'src/facetSupport/facetBinder'
import GenericMessage from '../../Messages/GenericMessage'
import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'
import FastMask from 'src/components/FastMask/FastMask'

import { uploadImage } from '../../../store/actions/user-uploads'

import './RoomTypeDetector.scss'
import RoomPiece from './RoomPiece'
import Card from './Card'
import { activate } from 'src/store/actions/live-palette'
import useDeepLabModel, { deepLabModels } from 'src/shared/hooks/useDeepLabModel'
import useDeepLabModelForSegmentation from 'src/shared/hooks/useDeepLabModelForSegmentation'

export const ColorCollector = createContext<Object>({})

const FILE_UPLOAD_ID = uniqueId('roomTypeDetectorFileUpload_')

const RoomTypeDetector = () => {
  const dispatch = useDispatch()
  const [uploadedImage, setUploadedImage] = useState()
  const deeplabModel = useDeepLabModel(deepLabModels.ADE20K, 4)
  const [results, success, error, isLoading, isProcessing] = useDeepLabModelForSegmentation(deeplabModel, uploadedImage)

  const {
    displayedLabels,
    relevantLabels,
    pieces: roomPieces,
    segmentationMapImagePath
  } = results || {}

  const handleChange = useCallback((e) => {
    const { target } = e

    if (target && target.files && target.files[0]) {
      dispatch(uploadImage(e.target.files[0]))
      setUploadedImage(URL.createObjectURL(e.target.files[0]))
    }
  })

  const contextValues = useMemo(() => ({
    update: hex => {
      const c = {
        hex: hex
      }

      // $FlowIgnore -- this is kind of a hack, since activate() expects a full Color object, but we're just dealing with hexes
      dispatch(activate(c))
    }
  }), [])

  if (deeplabModel === null) {
    return (
      <GenericMessage>Loading model...</GenericMessage>
    )
  }

  if (error) {
    return (
      <GenericMessage type={GenericMessage.TYPES.ERROR}>{error}</GenericMessage>
    )
  }

  return (
    <ColorCollector.Provider value={contextValues}>
      <FileInput onChange={handleChange} disabled={false} id={FILE_UPLOAD_ID} placeholder={uploadedImage ? 'Select new image' : 'Select an image'} />

      <div className='RoomTypeDetector__side-by-side'>
        {uploadedImage ? <>
          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Original Image' image={!isLoading ? uploadedImage : undefined} omitShim={isProcessing}>
              {isLoading ? (
                <CircleLoader />
              ) : isProcessing ? (
                <GenericOverlay type={GenericOverlay.TYPES.LOADING} message='Detecting...' semitransparent />
              ) : null}
            </Card>
          </div>

          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Detected Regions' image={segmentationMapImagePath}>
              {isLoading || isProcessing ? (
                <CircleLoader />
              ) : null}
            </Card>
          </div>

          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Fast Mask'>
              <FastMask hideUploadBtn />
            </Card>
          </div>
        </> : null}
      </div>

      {success && relevantLabels.length ? (
        <ul className='RoomTypeDetector__labels'>
          {relevantLabels.map((l, i) => {
            return (
              <li key={i} className={`RoomTypeDetector__labels__label ${displayedLabels.indexOf(l) > -1 ? 'RoomTypeDetector__labels__label--bold' : ''}`}>
                {l}
              </li>
            )
          })}
        </ul>
      ) : null}

      {success && roomPieces && roomPieces.length ? (
        <div className='RoomTypeDetector__found-pieces'>
          {roomPieces.map((piece, index) => <div key={piece.label} className='RoomTypeDetector__found-pieces__piece'>
            <RoomPiece width={piece.width} height={piece.height} label={piece.label} pixels={piece.pixels} legendColor={piece.legendColor} />
          </div>)}
        </div>
      ) : null}
    </ColorCollector.Provider>
  )
}

export default facetBinder(RoomTypeDetector, 'RoomTypeDetector')
