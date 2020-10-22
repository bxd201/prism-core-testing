/* eslint-disable react/jsx-no-bind */
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react'
import { useSelector } from 'react-redux'
import { useRouteMatch, NavLink } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { AutoSizer } from 'react-virtualized'
import { Menu, MenuItem, Wrapper, Button } from 'react-aria-menubutton'
import at from 'lodash/at'
import difference from 'lodash/difference'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MODE_CLASS_NAMES } from '../shared'
import ButtonBar from 'src/components/GeneralButtons/ButtonBar/ButtonBar'
import { generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import ColorWallContext from '../ColorWallContext'
import './ColorWallMenuBar.scss'

const PATH_END_FAMILY = 'family/'

export default () => {
  const { path, params: { section, family } } = useRouteMatch()
  const { sections = [], families = [] } = useSelector(state => state.colors)
  const { section: activeSection, family: activeFamily } = useSelector(state => state.colors)
  const isFamilyView = !!family || path.endsWith(PATH_END_FAMILY)
  const menuBarPrefix = 'menu-bar'
  const [menuOpen, setMenuOpen] = useState(false)
  const [showingAllColorFamilies, setShowingAllColorFamilies] = useState(false)
  const { messages = {} } = useIntl()
  const allColorsLabelText = at(messages, 'ALL_COLORS')[0]
  const allCollectionsLabelText = at(messages, 'SELECT_COLLECTION')[0]
  const [currentFamily, setNavMenuButtonText] = useState(allCollectionsLabelText)

  // -----------------------------------------
  // section hiding
  const { hiddenSections } = useContext(ColorWallContext)
  const visibleSections = useMemo(() => {
    if (sections && sections.length && hiddenSections && hiddenSections.length) {
      return difference(sections, hiddenSections)
    }

    return sections
  }, [ hiddenSections, sections ])

  // -----------------------------------------
  // handlers
  const handleColorFamilySelection = useCallback(function (value) {
    setNavMenuButtonText(allColorsLabelText)
    setShowingAllColorFamilies(true)
  }, [allColorsLabelText])
  const handleMenuToggle = useCallback(({ isOpen }) => setMenuOpen(isOpen))

  // -----------------------------------------
  // UI state toggling based on active sections and families
  useEffect(() => {
    if (activeFamily) {
      setShowingAllColorFamilies(false)
      setNavMenuButtonText(activeFamily)
    } else if (activeSection && !showingAllColorFamilies) {
      setNavMenuButtonText(activeSection)
    }
  }, [activeFamily, activeSection, showingAllColorFamilies])

  // -----------------------------------------
  // generate color families and search snippet
  // TODO: make this its own component, since that's basically waht we're doing here.
  const colorFamiliesAndSearch = useMemo(() => (
    <div className={MODE_CLASS_NAMES.CELL}>
      <ButtonBar.Bar>
        {!isFamilyView && <>
          <ButtonBar.Button to={`${generateColorWallPageUrl(section, family)}search/`}>
            <FontAwesomeIcon className='color-families-svg' icon={['fa', 'search']} pull='left' />
            <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='SEARCH.SEARCH_COLOR' /></span>
          </ButtonBar.Button>
          <ButtonBar.Button disabled={families.length <= 1} onClick={handleColorFamilySelection} to={`${generateColorWallPageUrl(section)}${PATH_END_FAMILY}`}>
            <FontAwesomeIcon className='color-families-svg' icon={['fa', 'palette']} pull='left' />
            <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='COLOR_FAMILIES' /></span>
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
  ), [section, family, families, handleColorFamilySelection, isFamilyView])

  return (
    <AutoSizer disableHeight style={{ width: '100%' }}>
      {({ width }) => (
        <div className={MODE_CLASS_NAMES.BASE}>
          <div className={MODE_CLASS_NAMES.COL}>
            {colorFamiliesAndSearch}
            {isFamilyView && width > 768
              ? (
                <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
                  <ButtonBar.Bar>
                    {families.map(name =>
                      <ButtonBar.Button key={name} to={generateColorWallPageUrl(section, name)}>
                        <span className={MODE_CLASS_NAMES.DESC}>{name}</span>
                      </ButtonBar.Button>
                    )}
                  </ButtonBar.Bar>
                </div>
              )
              : (
                <Wrapper
                  className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT} ${menuBarPrefix} ${menuBarPrefix}--${menuOpen ? 'open' : 'closed'}`}
                  onMenuToggle={handleMenuToggle}>
                  <Button className={`${menuBarPrefix}__button`} tag='div'>
                    <span className={`${menuBarPrefix}__button-copy`}>{currentFamily}</span>
                    <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'angle-down']} pull='right' />
                  </Button>
                  <Menu className={`${menuBarPrefix}__menu`}>
                    {(isFamilyView || family ? families : visibleSections).map(name =>
                      <MenuItem className={`${menuBarPrefix}__menu-item`} key={name} text={name} value={name}>
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
              )
            }
          </div>
        </div>
      )}
    </AutoSizer>
  )
}
