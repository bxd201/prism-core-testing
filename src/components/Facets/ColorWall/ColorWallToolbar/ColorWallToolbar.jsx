// @flow
/* eslint-disable react/jsx-no-bind */
import React, { useContext, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useRouteMatch, NavLink } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { Menu, MenuItem, Wrapper, Button } from 'react-aria-menubutton'
import at from 'lodash/at'
import difference from 'lodash/difference'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AutoSizer } from 'react-virtualized'
import { MODE_CLASS_NAMES } from '../shared'
import ButtonBar from 'src/components/GeneralButtons/ButtonBar/ButtonBar'
import { generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import ColorWallContext from '../ColorWallContext'
import { navigateToIntendedDestination, setImageRotateBypass, setIsColorWallModallyPresented } from 'src/store/actions/navigation'
import './ColorWallMenuBar.scss'

const PATH_END_FAMILY = 'family/'
const menuBarPrefix = 'menu-bar'

export default () => {
  const { messages = {} } = useIntl()
  const { hiddenSections } = useContext(ColorWallContext)
  const { path, params: { section, family } } = useRouteMatch()
  const { sections = [], families = [], section: activeSection, family: activeFamily, primeColorWall } = useSelector(state => state.colors, shallowEqual)
  const dispatch = useDispatch()

  const isFamilyView: boolean = !!family || path.endsWith(PATH_END_FAMILY)
  const visibleSections: string[] = sections && sections.length && hiddenSections && hiddenSections.length ? difference(sections, hiddenSections) : sections

  const [wallSelectionMenuOpen, setWallSelectionMenuOpen] = useState(false)
  // This should have been set by staging action...
  const imageRotateBypassValue = useSelector(store => store.navigationIntent)
  const shouldShowCloseButton = useSelector(store => store.isColorwallModallyPresented)

  return (
    <AutoSizer disableHeight style={{ width: '100%' }}>
      {({ width }) => (
        <div className={MODE_CLASS_NAMES.BASE}>
          <div className={MODE_CLASS_NAMES.COL}>
            {/* Search and Family Button */}
            <div className={MODE_CLASS_NAMES.CELL}>
              <ButtonBar.Bar>
                {isFamilyView
                  ? (
                    <ButtonBar.Button to={generateColorWallPageUrl(section)}>
                      <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'times']} pull='left' />
                      <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='CANCEL' /></span>
                    </ButtonBar.Button>
                  )
                  : (
                    <>
                      <ButtonBar.Button to={`${generateColorWallPageUrl(section, family)}search/`}>
                        <FontAwesomeIcon className='color-families-svg' icon={['fa', 'search']} pull='left' />
                        <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='SEARCH.SEARCH_COLOR' /></span>
                      </ButtonBar.Button>
                      {families.length > 0 && (
                        <ButtonBar.Button disabled={families.length <= 1} to={`${generateColorWallPageUrl(section)}${PATH_END_FAMILY}`}>
                          <FontAwesomeIcon className='color-families-svg' icon={['fa', 'palette']} pull='left' />
                          <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='COLOR_FAMILIES' /></span>
                        </ButtonBar.Button>
                      )}
                    </>
                  )
                }
              </ButtonBar.Bar>
            </div>
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
              : ((isFamilyView || visibleSections.length > 1) &&
                <Wrapper className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT} ${menuBarPrefix}`} onMenuToggle={({ isOpen }) => setWallSelectionMenuOpen(isOpen)}>
                  {primeColorWall && width > 768 && (
                    <NavLink
                      className={`${menuBarPrefix}__prime-color-wall-button ${primeColorWall === activeSection ? 'disabled' : ''}`}
                      to={generateColorWallPageUrl(primeColorWall)}
                    >
                      {primeColorWall}
                    </NavLink>
                  )}
                  <Button className={`${menuBarPrefix}__button`} tag='div'>
                    <span className={`${menuBarPrefix}__button-copy`}>
                      {isFamilyView
                        ? (activeFamily && !wallSelectionMenuOpen) ? activeFamily : at(messages, 'ALL_COLORS')[0]
                        : (primeColorWall === activeSection) || wallSelectionMenuOpen ? at(messages, 'SELECT_COLLECTION')[0] : activeSection
                      }
                    </span>
                    <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'angle-down']} pull='right' />
                  </Button>
                  <Menu className={`${menuBarPrefix}__menu ${primeColorWall && width > 768 ? 'shift-left' : ''}`}>
                    {(isFamilyView || family ? families : visibleSections)
                      .filter((name: string) => activeFamily !== name && activeSection !== name && (width <= 768 || !primeColorWall || primeColorWall !== name))
                      .map((name: string) => (
                        <MenuItem className={`${menuBarPrefix}__menu-item`} key={name} text={name} value={name}>
                          <NavLink
                            className={`${menuBarPrefix}__menu-link`}
                            to={isFamilyView ? generateColorWallPageUrl(section, name) : generateColorWallPageUrl(name)}
                          >
                            <span className={MODE_CLASS_NAMES.DESC}>{name}</span>
                          </NavLink>
                        </MenuItem>
                      ))
                    }
                  </Menu>
                </Wrapper>
              )
            }
            {shouldShowCloseButton && (
              <button
                className='menu-bar__button-close'
                onClick={e => {
                  e.preventDefault()
                  dispatch(setIsColorWallModallyPresented(false))
                  dispatch(navigateToIntendedDestination())
                  dispatch(setImageRotateBypass(imageRotateBypassValue))
                }}
              >
                <FontAwesomeIcon className='color-families-svg' icon={['fa', 'times']} pull='left' />
                <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='CLOSE' /></span>
              </button>
            )}
          </div>
        </div>
      )}
    </AutoSizer>
  )
}
