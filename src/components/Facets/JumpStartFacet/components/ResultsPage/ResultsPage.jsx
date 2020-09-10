// @flow
import React from 'react'

import FastMask from 'src/components/FastMask/FastMask'
import LivePalette from 'src/components/LivePalette/LivePalette'

import './ResultsPage.scss'
import '../../JSFCommon.scss'
import { getRoomTypeFromRoomData } from '../../../../../shared/utils/roomClassifier.utils'
import startCase from 'lodash/startCase'

const baseClass = 'JSFResultsPage'

type ResultsPageProps = {
  roomData: any
}

function ResultsPage (props: ResultsPageProps) {
  const { roomData } = props

  const roomType = getRoomTypeFromRoomData(roomData)

  return (
    <div className={baseClass}>
      <div className='JSFCommon__band JSFCommon__band--pad'>
        <div className='JSFCommon__content'>
          <div className={`${baseClass}__summary ${baseClass}__cols`}>
            <div className={`${baseClass}__cols__col ${baseClass}__cols__col--content`}>
              <div className={`${baseClass}__summary__text JSFCommon__text`}>
                <h1 className='JSFCommon__title'>{`Your ${startCase(roomType)}`}</h1>
                <p className='JSFCommon__description'>Based on your space, our experts recommend trying these colors:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='JSFCommon__band JSFCommon__band'>
        <div className='JSFCommon__content'>
          <FastMask hideUploadBtn />
        </div>
      </div>
      <div className='JSFCommon__band'>
        <div className='JSFCommon__content'>
          <LivePalette />
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
