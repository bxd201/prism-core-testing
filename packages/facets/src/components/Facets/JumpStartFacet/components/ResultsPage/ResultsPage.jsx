// @flow
import React, { useEffect,useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import flatten from 'lodash/flatten'
import startCase from 'lodash/startCase'
import uniq from 'lodash/uniq'
import zip from 'lodash/zip'
import { type RoomType } from 'src/components/Facets/JumpStartFacet/JumpStartFacet'
import FastMask from 'src/components/FastMask/FastMask'
import LivePaletteWrapper from 'src/components/LivePalette/LivePaletteWrapper'
import { type Piece, type SegmentationResults } from 'src/shared/hooks/useDeepLabModelForSegmentation'
import { type Color } from 'src/shared/types/Colors.js.flow'
import { getRoomTypeFromRoomData } from 'src/shared/utils/roomClassifier.utils'
import { activate, empty,replaceLpColors } from '../../../../../store/actions/live-palette'
import RealColorView from '../../../../RealColor/RealColorView'
import { FurnitureDetail } from '../ResultsPage/FurnitureDetail'
import './ResultsPage.scss'
import '../../JSFCommon.scss'

const HOW_MANY_ROOM_OBJECTS = 3
const HOW_MANY_TOTAL_COLORS = 7 // this can probably be pulled from a LivePalette const

const baseClass = 'JSFResultsPage'

type ResultsPageProps = {
  roomData: SegmentationResults,
  reset: Function,
  roomTypeProbabilities: [RoomType, number][],
  uploadedImage: string
}

function ResultsPage (props: ResultsPageProps) {
  const { roomData = {}, reset, roomTypeProbabilities, uploadedImage } = props
  const { activeColor } = useSelector((store) => store.lp)

  const dispatch = useDispatch()
  const roomType = getRoomTypeFromRoomData(roomData.relevantLabels, roomTypeProbabilities)
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
              <div className={'jumpstart__logo'}><img onClick={goToStart} src={require('src/images/jumpstart/jumpstartlogo.png')} alt='jumpstart logo' /></div>
              <div className={`${baseClass}__summary__text JSFCommon__text`}>
                <h1 className='JSFCommon__title'>{`Let's Start Your ${startCase(roomType)} Project`}</h1>
                <p className='JSFCommon__description'>Based on your room and furnishings:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='JSFCommon__band--pad'>
        <div className='JSFCommon__content'>
          <RealColorView
            imageUrl={uploadedImage}
            activeColor={activeColor}
            cleanupCallback={() => void (0)}
            handlerError={() => void (0)}
            handleUpdate={() => void (0)} />
        </div>
      </div>
      <div className='JSFCommon__band'>
        <div className='JSFCommon__content'>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <FastMask hideUploadBtn onProcessingComplete={() => setFastMaskComplete(true)} />
            {isFastMaskComplete && roomObjects
              ? roomObjects.map((piece: Piece, i) => <div key={i} className={`JSFResultsPage__pin JSFResultsPage__pin--${i}`} style={{ left: `${piece.posX * 100}%`, top: `${piece.posY * 100}%` }}>
              {piece.label}
            </div>)
              : null}
          </div>
        </div>
      </div>
      <div className='JSFCommon__band'>
        <div className='JSFCommon__content'>
          <LivePaletteWrapper simple />
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
