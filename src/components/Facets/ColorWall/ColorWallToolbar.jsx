/* eslint-disable react/jsx-no-bind */
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouteMatch, NavLink } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { AutoSizer } from 'react-virtualized'
import { Menu, MenuItem, Wrapper, Button } from 'react-aria-menubutton'
import at from 'lodash/at'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MODE_CLASS_NAMES } from './shared'
import ButtonBar from '../../GeneralButtons/ButtonBar/ButtonBar'
import { generateColorWallPageUrl } from '../../../shared/helpers/ColorUtils'
import './ColorWallMenuBar.scss'

const PATH_END_FAMILY = 'family/'

export default () => {
  const { path, params: { section, family } } = useRouteMatch()
  const { sections = [], families = [] } = useSelector(state => state.colors)
  const activeSection = useSelector(state => state.colors.section)
  const activeFamily = useSelector(state => state.colors.family)
  const isFamilyView = !!family || path.endsWith(PATH_END_FAMILY)
  const menuBarPrefix = 'menu-bar'
  const [menuOpen, setMenuOpen] = useState(false)
  const [showingAllColorFamilies, setShowingAllColorFamilies] = useState(false)
  const { messages = {} } = useIntl()
  const allColorsLabelText = at(messages, 'ALL_COLORS')[0]
  const allCollectionsLabelText = at(messages, 'SELECT_COLLECTION')[0]
  const [currentFamily, setNavMenuButtonText] = useState(allCollectionsLabelText)
  const handleColorFamilySelection = function (value) {
    setNavMenuButtonText(allColorsLabelText)
    setShowingAllColorFamilies(true)
  }

  useEffect(() => {
    if (activeFamily) {
      setShowingAllColorFamilies(false)
      setNavMenuButtonText(activeFamily)
    } else if (activeSection && !showingAllColorFamilies) {
      setNavMenuButtonText(activeSection)
    }
  })

  const colorFamiliesAndSearch = () => {
    return (
      <div className={MODE_CLASS_NAMES.CELL}>
        <ButtonBar.Bar>
          {!isFamilyView && <>
            <ButtonBar.Button disabled={families.length <= 1} onClick={handleColorFamilySelection} to={`${generateColorWallPageUrl(section)}${PATH_END_FAMILY}`}>
              <FontAwesomeIcon className='color-families-svg' icon={['fa', 'palette']} pull='left' />
              <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='COLOR_FAMILIES' /></span>
            </ButtonBar.Button>
            <ButtonBar.Button to={`${generateColorWallPageUrl(section, family)}search/`}>
              <FontAwesomeIcon className='color-families-svg' icon={['fa', 'search']} pull='left' />
              <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='SEARCH.SEARCH' /></span>
            </ButtonBar.Button>
          </>}
          {!!isFamilyView && <>
            <ButtonBar.Button to={generateColorWallPageUrl(section)}>
              <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'times']} pull='left' />
              <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='CANCEL' /></span>
            </ButtonBar.Button>
          </>}
        </ButtonBar.Bar>
      </div>
    )
  }

  return (
    <AutoSizer disableHeight style={{ width: '100%' }}>
      {({ width }) => {
        if (width > 768) {
          return (
            <div className={MODE_CLASS_NAMES.BASE}>
              <div className={MODE_CLASS_NAMES.COL}>
                {colorFamiliesAndSearch()}
                <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
                  <ButtonBar.Bar>
                    {(isFamilyView ? families : sections).map(name =>
                      <ButtonBar.Button
                        key={name}
                        to={isFamilyView ? generateColorWallPageUrl(section, name) : generateColorWallPageUrl(name)}
                      >
                        <span className={MODE_CLASS_NAMES.DESC}>{name}</span>
                      </ButtonBar.Button>
                    )}
                  </ButtonBar.Bar>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={MODE_CLASS_NAMES.BASE}>
              <div className={MODE_CLASS_NAMES.COL}>
                {colorFamiliesAndSearch()}
                <Wrapper
                  className={`${menuBarPrefix} ${menuBarPrefix}--${menuOpen ? 'open' : 'closed'}`}
                  onMenuToggle={({ isOpen }) => { setMenuOpen(isOpen) }}>
                  <Button className={`${menuBarPrefix}__button`} tag='div'>
                    <span className={`${menuBarPrefix}__button-copy`}>{currentFamily}</span>
                    <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'angle-down']} pull='right' />
                  </Button>
                  <Menu className={`${menuBarPrefix}__menu`}>
                    {(isFamilyView || family ? families : sections).map(name =>
                      <MenuItem
                        className={`${menuBarPrefix}__menu-item`}
                        key={name}
                        text={name}
                        value={name}>
                        <NavLink
                          className={`${menuBarPrefix}__menu-link`}
                          to={isFamilyView ? generateColorWallPageUrl(section, name) : generateColorWallPageUrl(name)}
                        >
                          <span className={MODE_CLASS_NAMES.DESC}>{name}</span>
                        </NavLink>
                      </MenuItem>
                    )}
                  </Menu>
                </Wrapper>
              </div>
            </div>
          )
        }
      }}
    </AutoSizer>
  )
}
