// @flow
/* eslint-disable react/jsx-no-bind */
import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch, NavLink, useHistory, Link } from 'react-router-dom'
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
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { navigateToIntendedDestination, setImageRotateBypass, setIsColorWallModallyPresented } from 'src/store/actions/navigation'
import './ColorWallMenuBar.scss'

const PATH_END_FAMILY = 'family/'
const menuBarPrefix = 'menu-bar'

type SelectPropsT = {
  placeholderText: string,
  options: string[],
  options: { label: string, link: string }[],
  disabled?: boolean,
  onSelectOpened?: (boolean) => void
}

const Select = ({ placeholderText, options, disabled = false, onSelectOpened }: SelectPropsT) => (
  <Wrapper
    className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT} ${menuBarPrefix}`}
    onMenuToggle={({ isOpen }) => onSelectOpened?.(isOpen)}
  >
    <Button className={`${menuBarPrefix}__button`} disabled={disabled}>
      <span className={`${menuBarPrefix}__button-copy`}>{placeholderText}</span>
      <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'angle-down']} pull='right' />
    </Button>
    <Menu className={`${menuBarPrefix}__menu`}>
      {options.map(({ label, link }) => (
        <MenuItem className={`${menuBarPrefix}__menu-item`} key={label} text={label} value={label}>
          <Link className={`${menuBarPrefix}__menu-link`} to={link}>
            <span className={MODE_CLASS_NAMES.DESC}>{label}</span>
          </Link>
        </MenuItem>
      ))}
    </Menu>
  </Wrapper>
)

export default () => {
  const { messages = {} } = useIntl()
  const { hiddenSections } = useContext(ColorWallContext)
  const { uiStyle }: ConfigurationContextType = useContext(ConfigurationContext)
  const { path, params: { section, family } } = useRouteMatch()
  const { sections = [], families = [], section: activeSection, family: activeFamily, primeColorWall } = useSelector(state => state.colors)
  const dispatch = useDispatch()
  const history = useHistory()

  const isFamilyView: boolean = !!family || path.endsWith(PATH_END_FAMILY)
  const visibleSections: string[] = sections && sections.length && hiddenSections && hiddenSections.length ? difference(sections, hiddenSections) : sections

  const [wallSelectionMenuOpen, setWallSelectionMenuOpen] = useState(false)
  // This should have been set by staging action...
  const imageRotateBypassValue = useSelector(store => store.navigationIntent)
  const shouldShowCloseButton = useSelector(store => store.isColorwallModallyPresented)

  if (uiStyle === 'minimal') {
    return (
      <div className={MODE_CLASS_NAMES.BASE}>
        <div className={`${MODE_CLASS_NAMES.COL} ${menuBarPrefix}-minimal`}>
          <button
            className='search'
            onClick={() => history.push(`${generateColorWallPageUrl(section, family)}search/`)}
          >
            <FontAwesomeIcon icon={['fal', 'search']} size='lg' />
            <span style={{ opacity: '0.5', marginLeft: '15px' }}>
              <FormattedMessage id='SEARCH.SEARCH_FOR_A_COLOR' />
            </span>
          </button>
          <Select
            disabled={families.length < 2}
            placeholderText={activeFamily || messages['EXPLORE_COLOR_FAMILIES']}
            options={families
              .filter(f => f !== activeFamily)
              .map(label => ({ label, link: generateColorWallPageUrl(section, label) }))
            }
          />
          <Select
            disabled={visibleSections.length < 2}
            placeholderText={(activeSection === primeColorWall || !visibleSections.includes(activeSection)) ? messages['EXPLORE_COLLECTIONS'] : activeSection}
            options={visibleSections
              .filter(s => s !== activeSection)
              .map(label => ({ label, link: generateColorWallPageUrl(label) }))
            }
          />
          <button
            className='viewEntire'
            disabled={!visibleSections.includes(primeColorWall) || (primeColorWall === activeSection && !activeFamily)}
            onClick={() => history.push(generateColorWallPageUrl(primeColorWall))}
          >
            <FormattedMessage id='VIEW_ENTIRE_COLOR_WALL' />
          </button>
        </div>
      </div>
    )
  }

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
              : ((isFamilyView || visibleSections.length > 1) && (
                <div style={{ display: 'flex' }} className='menu-bar__border'>
                  {primeColorWall && visibleSections.includes(primeColorWall) && width > 768 && (
                    <NavLink
                      className={`${menuBarPrefix}__prime-color-wall-button ${primeColorWall === activeSection ? 'disabled' : ''}`}
                      to={generateColorWallPageUrl(primeColorWall)}
                    >
                      {primeColorWall}
                    </NavLink>
                  )}
                  <Select
                    placeholderText={
                      isFamilyView
                        ? (activeFamily && !wallSelectionMenuOpen) ? activeFamily : at(messages, 'ALL_COLORS')[0]
                        : (primeColorWall === activeSection) || wallSelectionMenuOpen ? at(messages, 'SELECT_COLLECTION')[0] : activeSection
                    }
                    options={(isFamilyView || family ? families : visibleSections)
                      .filter(name => activeFamily !== name && activeSection !== name && (width <= 768 || !primeColorWall || primeColorWall !== name))
                      .map(label => ({
                        label,
                        link: isFamilyView ? generateColorWallPageUrl(section, label) : generateColorWallPageUrl(label)
                      }))
                    }
                    onSelectOpened={setWallSelectionMenuOpen}
                  />
                </div>
              ))
            }
            {shouldShowCloseButton && !isFamilyView && (
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
