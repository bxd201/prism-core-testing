// @flow
/* eslint-disable react/jsx-no-bind */
import React, { useContext } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
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
const menuBarPrefix = 'menu-bar'

export default () => {
  const { messages = {} } = useIntl()
  const { hiddenSections } = useContext(ColorWallContext)
  const { path, params: { section, family } } = useRouteMatch()
  const { sections = [], families = [], section: activeSection, family: activeFamily, primeColorWall } = useSelector(state => state.colors, shallowEqual)

  // pretend this came from redux
  // const primeColorWall: string = 'Sherwin-Williams Colors'

  const isFamilyView: boolean = !!family || path.endsWith(PATH_END_FAMILY)
  const visibleSections: string[] = sections && sections.length && hiddenSections && hiddenSections.length ? difference(sections, hiddenSections) : sections

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
            {/* Wall selector or Family selector */}
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
              : (!isFamilyView && visibleSections.length > 0 &&
                <Wrapper className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT} ${menuBarPrefix}`}>
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
                      {activeFamily || (primeColorWall === activeSection && width > 768) ? at(messages, 'SELECT_COLLECTION')[0] : activeSection}
                    </span>
                    <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'angle-down']} pull='right' />
                  </Button>
                  <Menu className={`${menuBarPrefix}__menu ${primeColorWall ? 'shift-left' : ''}`}>
                    {(isFamilyView || family ? families : visibleSections)
                      .filter((name: string) => !primeColorWall || width < 768 || primeColorWall !== name)
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
          </div>
        </div>
      )}
    </AutoSizer>
  )
}
