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
  const [deeplabModel, modelLoading, modelError] = useDeepLabModel(deepLabModels.ADE20K, 4)
  const [segmentationResults, segmentationSuccess, segmentationError, segmentationLoading, segmentationProcessing] = useDeepLabModelForSegmentation(deeplabModel, uploadedImage)

  const {
    displayedLabels,
    relevantLabels,
    pieces: roomPieces,
    piecesData,
    segmentationMapImagePath
  } = segmentationResults || {}

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

  if (modelLoading) {
    return (
      <GenericMessage>Loading model...</GenericMessage>
    )
  }

  if (segmentationError || modelError) {
    return (
      <GenericMessage type={GenericMessage.TYPES.ERROR}>We've encountered an error.</GenericMessage>
    )
  }

  return (
    <ColorCollector.Provider value={contextValues}>
      <FileInput onChange={handleChange} disabled={false} id={FILE_UPLOAD_ID} placeholder={uploadedImage ? 'Select new image' : 'Select an image'} />

      <div className='RoomTypeDetector__side-by-side'>
        {uploadedImage ? <>
          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Original Image' image={!segmentationLoading ? uploadedImage : undefined} omitShim={segmentationProcessing}>
              {segmentationLoading ? (
                <CircleLoader />
              ) : segmentationProcessing ? (
                <GenericOverlay type={GenericOverlay.TYPES.LOADING} message='Detecting...' semitransparent />
              ) : null}
            </Card>
          </div>

          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Detected Regions' image={segmentationMapImagePath}>
              {segmentationLoading || segmentationProcessing ? (
                <CircleLoader />
              ) : null}
            </Card>
          </div>

          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Fast Mask' omitBodyPadding>
              <FastMask hideUploadBtn />
            </Card>
          </div>
        </> : null}
      </div>

      {segmentationSuccess && relevantLabels.length ? (
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

      {segmentationSuccess && roomPieces && roomPieces.length ? (
        <div className='RoomTypeDetector__found-pieces'>
          {roomPieces.map((piece, index) => <div key={piece.label} className='RoomTypeDetector__found-pieces__piece'>
            <RoomPiece label={piece.label}
              legendColor={piece.legendColor}
              image={piecesData[index].image}
              palette={piecesData[index].palette}
              swPalette={piecesData[index].swPalette}
              suggestedColors={piecesData[index].suggestedColors}
              swRecommendations={piecesData[index].recurringCoordinatingColors} />
          </div>)}
        </div>
      ) : null}
    </ColorCollector.Provider>
  )
}

export default facetBinder(RoomTypeDetector, 'RoomTypeDetector')
