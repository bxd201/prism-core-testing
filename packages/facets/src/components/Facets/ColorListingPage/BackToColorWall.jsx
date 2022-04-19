// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ButtonBar from '../../GeneralButtons/ButtonBar/ButtonBar'
import { generateColorWallPageUrl, fullColorName } from '../../../shared/helpers/ColorUtils'
import { MODE_CLASS_NAMES } from '../ColorWall/shared'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import { urlWorker } from '../../../shared/helpers/URLUtils'
import { ROUTE_PARAMS } from 'constants/globals'
import 'src/providers/fontawesome/fontawesome'

export function BackToColorWall () {
  const { items: { colorMap = {} }, family, section, search }: ColorsState = useSelector(state => state.colors)
  const { colorId }: { colorId?: ?string } = useParams()

  const color = colorId && colorMap[colorId]
  const colorWallUrl = color ? generateColorWallPageUrl(section, family, color.id, fullColorName(color)) : generateColorWallPageUrl(section, family)
  const url = search.active && search.query ? urlWorker.set(ROUTE_PARAMS.SEARCH, search.query).in(colorWallUrl) : colorWallUrl

  return (
    <div className={MODE_CLASS_NAMES.BASE}>
      <div className={MODE_CLASS_NAMES.COL}>
        <div className={MODE_CLASS_NAMES.CELL}>
          <ButtonBar.Bar>
            <ButtonBar.Button to={url}>
              <FontAwesomeIcon icon={['fal', 'th-large']} pull='left' fixedWidth />
              <FormattedMessage id='BACK_TO_COLOR_WALL' />
            </ButtonBar.Button>
          </ButtonBar.Bar>
        </div>
      </div>
    </div>
  )
}

export default BackToColorWall
