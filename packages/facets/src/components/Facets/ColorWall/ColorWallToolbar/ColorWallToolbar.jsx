/* eslint-disable */
// @flow
/* eslint-disable react/jsx-no-bind */
import React, { type Element, useContext, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch, NavLink, useHistory, Link } from 'react-router-dom'
import { filterByFamily, filterBySection } from 'src/store/actions/loadColors'
import { FormattedMessage, useIntl } from 'react-intl'
import { Menu, MenuItem, Wrapper, Button } from 'react-aria-menubutton'
import at from 'lodash/at'
import kebabCase from 'lodash/kebabCase'
import difference from 'lodash/difference'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AutoSizer } from 'react-virtualized'
import { MODE_CLASS_NAMES } from '../shared'
import ButtonBar from 'src/components/GeneralButtons/ButtonBar/ButtonBar'
import { generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import ColorWallContext from '../ColorWallContext'
import ConfigurationContext, {
  type ConfigurationContextType
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { navigateToIntendedDestination, setIsColorWallModallyPresented } from 'src/store/actions/navigation'
import './ColorWallMenuBar.scss'
import '../../../GeneralButtons/ButtonBar/ButtonBar.scss'
import omitPrefix from 'src/shared/utils/omitPrefix.util'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import useGroupsAndSubgroups from 'src/shared/hooks/useGroupsAndSubgroups'

const PATH_END_FAMILY = 'family/'
const menuBarPrefix = 'menu-bar'
const menuBarItemList = `${menuBarPrefix}__menu-item`
const menuBarActiveList = `${menuBarItemList}--active`
const menuBarInactive = `${menuBarItemList}--inactive`

type SelectPropsT = {
  activeFamily?: string,
  activeSection?: string,
  disabled?: boolean,
  options: { label: string, link: string }[],
  onSelectOpened?: (boolean) => void,
  placeholderText: string
}

const Select = ({
  activeFamily,
  activeSection,
  placeholderText,
  options,
  disabled = false,
  onSelectOpened
}: SelectPropsT) => (
  <Wrapper
    className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT} ${menuBarPrefix}`}
    onMenuToggle={({ isOpen }) => onSelectOpened?.(isOpen)}
  >
    <Button className={`${menuBarPrefix}__button`} disabled={disabled}>
      <span className={`${menuBarPrefix}__button-copy`}>{omitPrefix(placeholderText)}</span>
      <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'angle-down']} pull='right' />
    </Button>
    <Menu className={`${menuBarPrefix}__menu`}>
      {options.map(({ label, link }) => (
        <MenuItem className={`${menuBarItemList}`} key={label} text={omitPrefix(label)} value={label}>
          <Link
            className={`${menuBarPrefix}__menu-link ${
              ((activeSection ?? activeFamily) || 'All') === label ? menuBarActiveList : menuBarInactive
            }`}
            to={{ data: activeSection ?? label, pathname: link, state: label }}
          >
            <span className={MODE_CLASS_NAMES.DESC}>{omitPrefix(label)}</span>
          </Link>
        </MenuItem>
      ))}
    </Menu>
  </Wrapper>
)

type ColorFamilyMenuBtnsT = {
  showAll?: boolean,
  section: string,
  families: string[]
}

const ColorFamilyMenuBtns = ({ showAll = false, section, families = [] }: ColorFamilyMenuBtnsT) => {
  const { brandId }: ConfigurationContextType = useContext(ConfigurationContext)

  if (families.length) {
    return (
      <>
        {showAll ? (
          <ButtonBar.Button
            isActive={(match, location) => {
              if (!match) {
                return false
              }

              return !!location.pathname.match(new RegExp(`${match.url}/?(/color/.*)?/?$`))
            }}
            style={{ justifyContent: 'center', width: '100%' }}
            to={generateColorWallPageUrl(section)}
          >
            <span className={MODE_CLASS_NAMES.DESC}>All</span>
          </ButtonBar.Button>
        ) : null}
        {families.map((name) => (
          <ButtonBar.Button
            key={name}
            onClick={() =>
              GA.event(
                { category: 'Color Wall', action: 'Color Family Menu Click', label: name },
                GA_TRACKER_NAME_BRAND[brandId]
              )
            }
            style={{ justifyContent: 'center', width: '100%' }}
            to={generateColorWallPageUrl(section, name)}
          >
            <span className={MODE_CLASS_NAMES.DESC}>{omitPrefix(name)}</span>
          </ButtonBar.Button>
        ))}
      </>
    )
  }

  return null
}

const ColorWallToolbar = () => {
  const { messages = {} } = useIntl()
  const { hiddenSections } = useContext(ColorWallContext)
  const {
    groups: sections,
    group: activeSection,
    subgroups: families,
    subgroup: activeFamily
  } = useGroupsAndSubgroups(hiddenSections)
  const {
    alwaysShowColorFamilies,
    colorWall = {},
    cvw = {},
    uiStyle
  } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { closeBtn = {} } = cvw
  const { showArrow: closeBtnShowArrow = true, text: closeBtnText = <FormattedMessage id='CLOSE' /> } = closeBtn
  const {
    path,
    params: { section, family }
  } = useRouteMatch()
  const { primeColorWall } = useSelector((state) => state.colors)
  const dispatch = useDispatch()
  const history = useHistory()
  const isFamilyView: boolean = !!family || path.endsWith(PATH_END_FAMILY)
  const visibleSections: string[] = sections

  // This should have been set by staging action...
  const shouldShowCloseButton = useSelector((store) => store.isColorwallModallyPresented)

  // keeps redux store and url in sync for family and section data
  useEffect(() => {
    if (activeSection === primeColorWall && section && section !== kebabCase(primeColorWall)) {
      dispatch(filterBySection(section))
    }
    if (!activeFamily && family) {
      dispatch(filterByFamily(family))
    }
  }, [])

  const searchColorBtn: Element<any> = (
    <ButtonBar.Button to={`${generateColorWallPageUrl(section, family)}search/`}>
      <span className={MODE_CLASS_NAMES.DESC}>
        {colorWall.searchColor ?? <FormattedMessage id='SEARCH.SEARCH_COLOR' />}
      </span>
      <FontAwesomeIcon className='color-families-svg' icon={['fa', 'search']} pull='left' />
    </ButtonBar.Button>
  )

  const colorFamilyMenu = useRef(null)

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
              .filter((f) => f !== activeFamily)
              .map((label) => ({ label, link: generateColorWallPageUrl(section, label) }))}
          />
          <Select
            disabled={visibleSections.length < 2}
            placeholderText={
              activeSection === primeColorWall || !visibleSections.includes(activeSection)
                ? colorWall.selectSectionText ?? messages['EXPLORE_COLLECTIONS']
                : activeSection
            }
            options={visibleSections
              .filter((s) => s !== activeSection)
              .map((label) => ({ label, link: generateColorWallPageUrl(label) }))}
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
            {/* Search and Family Buttons */}
            <div className={MODE_CLASS_NAMES.CELL}>
              <ButtonBar.Bar style={alwaysShowColorFamilies ? { borderRadius: '0' } : {}}>
                {isFamilyView && !alwaysShowColorFamilies ? (
                  <ButtonBar.Button to={generateColorWallPageUrl(section)}>
                    <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'times']} pull='left' />
                    <span className={MODE_CLASS_NAMES.DESC}>
                      <FormattedMessage id='CANCEL' />
                    </span>
                  </ButtonBar.Button>
                ) : (
                  <>
                    {searchColorBtn}
                    {!alwaysShowColorFamilies && families.length > 0 && (
                      <ButtonBar.Button
                        disabled={families.length <= 1}
                        to={`${generateColorWallPageUrl(section)}${PATH_END_FAMILY}`}
                      >
                        <FontAwesomeIcon className='color-families-svg' icon={['fa', 'palette']} pull='left' />
                        <span className={MODE_CLASS_NAMES.DESC}>
                          <FormattedMessage id='COLOR_FAMILIES' />
                        </span>
                      </ButtonBar.Button>
                    )}
                  </>
                )}
              </ButtonBar.Bar>
            </div>
            {/* Prime Color Wall and Collections/Families Categories Buttons */}
            {width > 768 ? (
              <>
                {visibleSections.length > 1 && (!isFamilyView || alwaysShowColorFamilies) && (
                  <div className='menu-bar__border'>
                    {primeColorWall && visibleSections.includes(primeColorWall) && (
                      <NavLink
                        className={`${menuBarPrefix}__prime-color-wall-button ${
                          primeColorWall === activeSection ? 'disabled' : ''
                        }`}
                        to={generateColorWallPageUrl(primeColorWall)}
                      >
                        {primeColorWall}
                      </NavLink>
                    )}
                    {(visibleSections.length > 1 || (isFamilyView && !alwaysShowColorFamilies)) && (
                      <Select
                        activeSection={activeSection}
                        placeholderText={
                          activeSection === primeColorWall
                            ? colorWall.selectSectionText ?? at(messages, 'SELECT_COLLECTION')[0]
                            : activeSection
                        }
                        options={visibleSections
                          .filter((name) => activeFamily !== name && (!primeColorWall || primeColorWall !== name))
                          .map((label) => ({ label, link: generateColorWallPageUrl(label) }))}
                      />
                    )}
                  </div>
                )}
              </>
            ) : (
              // width <= 768
              <div
                className={`menu-bar${
                  visibleSections.length > 1 || isFamilyView || alwaysShowColorFamilies ? '__border' : ''
                }
                ${visibleSections.length > 1 && alwaysShowColorFamilies ? ' menu-bar__border--flex' : ''}`}
              >
                {/* Collections/Families */}
                {(visibleSections.length > 1 || (isFamilyView && !alwaysShowColorFamilies)) && (
                  <Select
                    activeSection={activeSection}
                    placeholderText={
                      isFamilyView && !alwaysShowColorFamilies
                        ? activeFamily ?? at(messages, 'ALL_COLORS')[0]
                        : activeSection
                    }
                    options={((isFamilyView || family) && !alwaysShowColorFamilies ? families : visibleSections)
                      .filter(
                        (name) => activeFamily !== name && (width <= 768 || !primeColorWall || primeColorWall !== name)
                      )
                      .map((label) => ({
                        label,
                        link:
                          isFamilyView && !alwaysShowColorFamilies
                            ? generateColorWallPageUrl(section, label)
                            : generateColorWallPageUrl(label)
                      }))}
                  />
                )}
                {/* Families */}
                {alwaysShowColorFamilies && colorFamilyMenu.current?.clientWidth > width && (
                  <>
                    {visibleSections.length > 1 && <span className='menu-bar__border' />}
                    <Select
                      activeFamily={activeFamily}
                      placeholderText={activeFamily ?? 'All'}
                      disabled={families.length < 1}
                      options={[
                        { label: 'All', link: generateColorWallPageUrl(section) },
                        ...families.map((label) => ({
                          label,
                          link: generateColorWallPageUrl(section, label)
                        }))
                      ]}
                    />
                  </>
                )}
              </div>
            )}
            {shouldShowCloseButton && (!isFamilyView || alwaysShowColorFamilies) && (
              <button
                className='menu-bar__button-close'
                onClick={(e) => {
                  e.preventDefault()
                  dispatch(setIsColorWallModallyPresented())
                  dispatch(navigateToIntendedDestination())
                }}
                style={alwaysShowColorFamilies ? { borderRadius: '0', textTransform: 'uppercase' } : {}}
              >
                {closeBtnShowArrow && (
                  <FontAwesomeIcon className='color-families-svg' icon={['fa', 'times']} pull='left' />
                )}
                <span className={MODE_CLASS_NAMES.DESC}>{closeBtnText ?? <FormattedMessage id='CLOSE' />}</span>
              </button>
            )}
            {/* Color Families Menu Bar Left Side */}
            {isFamilyView && !alwaysShowColorFamilies && width > 768 && (
              <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
                <ButtonBar.Bar>
                  <ColorFamilyMenuBtns families={families} section={section} />
                </ButtonBar.Bar>
              </div>
            )}
          </div>
          {/* Color Families Menu Bar Full Size */}
          {alwaysShowColorFamilies && (
            <>
              {/* Color family menu measurer ref - hidden */}
              <div className='color-family-menu color-family-menu__width-size' ref={colorFamilyMenu}>
                <ColorFamilyMenuBtns showAll families={families} section={section} />
              </div>
              {families && colorFamilyMenu.current?.clientWidth < width && (
                <div className='color-family-menu'>
                  <ColorFamilyMenuBtns showAll families={families} section={section} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </AutoSizer>
  )
}

export default ColorWallToolbar
