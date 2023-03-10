// @flow
import React, { createContext, useCallback, useMemo,useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import uniqueId from 'lodash/uniqueId'
import FastMask from 'src/components/FastMask/FastMask'
import facetBinder from 'src/facetSupport/facetBinder'
import useDeepLabModel, { deepLabModels } from 'src/shared/hooks/useDeepLabModel'
import useDeepLabModelForSegmentation from 'src/shared/hooks/useDeepLabModelForSegmentation'
// import QRCodeUploader from './QRCodeUploader'
import { activate } from 'src/store/actions/live-palette'
import { uploadImage } from '../../../store/actions/user-uploads'
import FileInput from '../../FileInput/FileInput'
import GenericMessage from '../../Messages/GenericMessage'
import { CircleLoader, GenericOverlay } from '../../ToolkitComponents'
import Card from './Card'
import RoomPiece from './RoomPiece'
import './RoomTypeDetector.scss'

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

  const { formatMessage } = useIntl()

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
      <GenericMessage><FormattedMessage id='LOADING_MODEL' />...</GenericMessage>
    )
  }

  if (segmentationError || modelError) {
    return (
      <GenericMessage type={GenericMessage.TYPES.ERROR}><FormattedMessage id='ERROR_ENCOUNTERED' /></GenericMessage>
    )
  }

  return (
    <ColorCollector.Provider value={contextValues}>
      {/* <QRCodeUploader setUploadedImage={setUploadedImage} /> */}
      <FileInput onChange={handleChange} disabled={false} id={FILE_UPLOAD_ID} placeholder={uploadedImage ? `${formatMessage({ id: 'SELECT_NEW_IMAGE' })}` : `${formatMessage({ id: 'SELECT_IMAGE' })}`} />

      <div className='RoomTypeDetector__side-by-side'>
        {uploadedImage
          ? <>
          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title={`${formatMessage({ id: 'ORIGINAL_IMAGE' })}`} image={!segmentationLoading ? uploadedImage : undefined} omitShim={segmentationProcessing}>
              {segmentationLoading
                ? (
                <CircleLoader />
                  )
                : segmentationProcessing
                  ? (
                <GenericOverlay type={GenericOverlay.TYPES.LOADING} message={`${formatMessage({ id: 'DETECTING' })}...`} semitransparent />
                    )
                  : null}
            </Card>
          </div>

          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title={`${formatMessage({ id: 'DETECTED_REGIONS' })}`} image={segmentationMapImagePath}>
              {segmentationLoading || segmentationProcessing
                ? (
                <CircleLoader />
                  )
                : null}
            </Card>
          </div>

          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Fast Mask' omitBodyPadding>
              <FastMask hideUploadBtn />
            </Card>
          </div>
        </>
          : null}
      </div>

      {segmentationSuccess && relevantLabels.length
        ? (
        <ul className='RoomTypeDetector__labels'>
          {relevantLabels.map((l, i) => {
            return (
              <li key={i} className={`RoomTypeDetector__labels__label ${displayedLabels.indexOf(l) > -1 ? 'RoomTypeDetector__labels__label--bold' : ''}`}>
                {l}
              </li>
            )
          })}
        </ul>
          )
        : null}

      {segmentationSuccess && roomPieces && roomPieces.length
        ? (
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
          )
        : null}
    </ColorCollector.Provider>
  )
}

export default facetBinder(RoomTypeDetector, 'RoomTypeDetector')
