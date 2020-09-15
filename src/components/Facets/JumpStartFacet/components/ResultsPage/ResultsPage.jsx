// @flow
import React, { useState, useEffect } from 'react'
import FastMask from 'src/components/FastMask/FastMask'
import SimpleLivePalette from 'src/components/LivePalette/SimpleLivePalette'
import { useDispatch } from 'react-redux'
import startCase from 'lodash/startCase'
import flatten from 'lodash/flatten'
import uniq from 'lodash/uniq'
import zip from 'lodash/zip'

import './ResultsPage.scss'
import '../../JSFCommon.scss'

import { getRoomTypeFromRoomData } from 'src/shared/utils/roomClassifier.utils'
import { type Piece, type SegmentationResults } from 'src/shared/hooks/useDeepLabModelForSegmentation'

import { type Color } from 'src/shared/types/Colors.js.flow'
import { activate, replaceLpColors, empty } from '../../../../../store/actions/live-palette'
import { FurnitureDetail } from '../ResultsPage/FurnitureDetail'

const HOW_MANY_ROOM_OBJECTS = 3
const HOW_MANY_TOTAL_COLORS = 7 // this can probably be pulled from a LivePalette const

const baseClass = 'JSFResultsPage'

type ResultsPageProps = {
  roomData: SegmentationResults,
  reset: Function
}

function ResultsPage ({ roomData = {}, reset }: ResultsPageProps) {
  const dispatch = useDispatch()
  const roomType = getRoomTypeFromRoomData(roomData.relevantLabels)
  const [isFastMaskComplete, setFastMaskComplete] = useState(false)
  const [roomObjects, setRoomObjects] = useState([])
  const [furnitureInfo, setFurnitureInfo] = useState([])

  useEffect(() => {
    const { piecesData, pieces } = roomData

    const relevantRoomObjects = pieces.slice(0, HOW_MANY_ROOM_OBJECTS)
    const relevantRoomColorData = relevantRoomObjects.map((obj, i) => piecesData[i])
    const colorsPerObject = Math.floor(HOW_MANY_TOTAL_COLORS / HOW_MANY_ROOM_OBJECTS)
    const extraColorsForFirst = HOW_MANY_TOTAL_COLORS - (colorsPerObject * HOW_MANY_ROOM_OBJECTS)

    const relevantColorGroups = relevantRoomColorData.map((colorData, i) => {
      const howManyCoordinating = Math.floor(colorsPerObject / 2)
      const howManySuggested = colorsPerObject - howManyCoordinating + (i === 0 ? extraColorsForFirst : 0)
      const dataSuggested: Color[] = colorData.suggestedColors.slice(0, howManySuggested)
      const dataCoordinating: Color[] = colorData.recurringCoordinatingColors.slice(0, howManyCoordinating)

      return [
        ...dataSuggested,
        ...dataCoordinating
      ]
    })

    // this thing eliminates room objects if their total accumulated color count would surpass the HOW_MANY_TOTAL_COLORS value
    const totalCollectedColors = relevantColorGroups.reduce((accum, curr) => {
      if (accum[1] + curr.length > HOW_MANY_TOTAL_COLORS) {
        return accum
      }

      return [
        [
          ...accum[0],
          curr
        ],
        accum[1] + curr.length
      ]
    }, [[], 0])[0]

    const finalRelevantRoomObjects = relevantRoomObjects.slice(0, totalCollectedColors.length)
    setRoomObjects(finalRelevantRoomObjects)

    const finalRelevantColorGroups = relevantColorGroups.slice(0, totalCollectedColors.length)
    const furnitureInfo = finalRelevantRoomObjects.map((roomObjects, i) => {
      roomObjects.relevantColorGroup = finalRelevantColorGroups[i]
      return roomObjects
    })
    setFurnitureInfo(furnitureInfo)
    const livePaletteData: Color[] = uniq(flatten(zip.apply(undefined, finalRelevantColorGroups)).filter(v => !!v))

    if (livePaletteData && livePaletteData.length) {
      dispatch(replaceLpColors(livePaletteData))
      dispatch(activate(livePaletteData[0]))
    } else {
      // TODO: Handle an error case where we've processed everything and we have no data to show for it
      dispatch(replaceLpColors([]))
      dispatch(empty())
      console.error('We found no matching colors.')
    }
  }, [roomData])

  const goToStart = (e: SyntheticEvent) => {
    e.preventDefault()
    reset()
  }

  return (
    <div className={baseClass}>
      <div className='JSFCommon__band JSFCommon__band--pad'>
        <div className='JSFCommon__content'>
          <div className={`${baseClass}__summary ${baseClass}__cols`}>
            <div className={`${baseClass}__cols__col ${baseClass}__cols__col--content`}>
              <div className={'jumpstart__logo'}><img onClick={goToStart} src={'src/images/jumpstart/jumpstartlogo.png'} alt='jumpstart logo' /></div>
              <div className={`${baseClass}__summary__text JSFCommon__text`}>
                <h1 className='JSFCommon__title'>{`Your Custom ${startCase(roomType)} Color Palette`}</h1>
                <p className='JSFCommon__description'>Based on your room and furnishings:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='JSFCommon__band'>
        <div className='JSFCommon__content'>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <FastMask hideUploadBtn onProcessingComplete={() => setFastMaskComplete(true)} />
            {isFastMaskComplete && roomObjects ? roomObjects.map((piece: Piece, i) => <div key={i} className={`JSFResultsPage__pin JSFResultsPage__pin--${i}`} style={{ left: `${piece.posX * 100}%`, top: `${piece.posY * 100}%` }}>
              {piece.label}
            </div>) : null}
          </div>
        </div>
      </div>
      <div className='JSFCommon__band'>
        <div className='JSFCommon__content'>
          <SimpleLivePalette />
        </div>
      </div>
      <div className='JSFCommon__band JSFCommon__band--pad'>
        <div className='JSFCommon__content'>
          <FurnitureDetail furnitureInfo={furnitureInfo} />
        </div>
      </div>
      <div className={'JSFResultsPage__restart-wrapper'}>
        <div className={'JSFResultsPage__restart-wrapper__inset'}>
          <div className={'JSFResultsPage__restart-wrapper__desc'}>Ready to try another room?</div>
          <div><button onClick={goToStart} className={'JSFResultsPage__restart-wrapper__btn'}>Start Over</button></div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
