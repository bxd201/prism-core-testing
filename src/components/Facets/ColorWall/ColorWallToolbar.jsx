import React from 'react'
import { useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MODE_CLASS_NAMES } from './shared'
import ButtonBar from '../../GeneralButtons/ButtonBar/ButtonBar'
import { generateColorWallPageUrl } from '../../../shared/helpers/ColorUtils'

const PATH_END_FAMILY = 'family/'

export default () => {
  const { path, params: { section, family } } = useRouteMatch()
  const { sections = [], families = [] } = useSelector(state => state.colors)
  const isFamilyView = path.endsWith(PATH_END_FAMILY)

  return (
    <div className={MODE_CLASS_NAMES.BASE}>
      <div className={MODE_CLASS_NAMES.COL}>
        <div className={MODE_CLASS_NAMES.CELL}>
          <ButtonBar.Bar>
            {(isFamilyView || family ? families : sections).map(name =>
              <ButtonBar.Button
                key={name}
                to={isFamilyView || family ? generateColorWallPageUrl(section, name) : generateColorWallPageUrl(name)}
              >
                <span className={MODE_CLASS_NAMES.DESC}>{name}</span>
              </ButtonBar.Button>
            )}
          </ButtonBar.Bar>
        </div>
        <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
          <ButtonBar.Bar>
            {!isFamilyView && <ButtonBar.Button disabled={families.length <= 1} to={`${generateColorWallPageUrl(section)}${PATH_END_FAMILY}`}>
              <FontAwesomeIcon className='color-families-svg' icon={['fa', 'palette']} pull='left' />
              <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='COLOR_FAMILIES' /></span>
            </ButtonBar.Button>}
            {!isFamilyView && <ButtonBar.Button to={`${generateColorWallPageUrl(section, family)}search/`}>
              <FontAwesomeIcon className='color-families-svg' icon={['fa', 'search']} pull='left' />
              <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='SEARCH.SEARCH' /></span>
            </ButtonBar.Button>}
            {isFamilyView && <ButtonBar.Button to={generateColorWallPageUrl(section)}>
              <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'times']} pull='left' />
              <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='CANCEL' /></span>
            </ButtonBar.Button>}
          </ButtonBar.Bar>
        </div>
      </div>
    </div>
  )
}
