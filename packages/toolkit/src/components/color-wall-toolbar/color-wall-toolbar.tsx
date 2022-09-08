import React, { useRef } from 'react'
import { Menu, MenuItem, Wrapper, Button } from 'react-aria-menubutton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/pro-light-svg-icons'
import { faAngleDown } from '@fortawesome/pro-solid-svg-icons'
import { AutoSizer } from 'react-virtualized'
import ButtonBar from './button-bar'

const menuBarPrefix = 'menu-bar'
const menuBarItemList = `${menuBarPrefix}__menu-item`
const menuBarInactive = `${menuBarItemList}--inactive`

function omitPrefix(str: string = ''): string {
  if (typeof str === 'string') {
    return str.replace(/@\|@.*@\|@/g, '')
  }
  return ''
}

export const TEST_ID_SEARCH = 'search-btn'
export const TEST_ID_SUBGROUP = 'subgroup-btn'
export const TEST_ID_GROUP = 'group-btn'
export const TEST_ID_VIEWALL = 'view-all-btn'

export const MODE_CLASS_NAMES = {
  BASE: 'text-base font-sans',
  DESC: 'color-wall-mode-btns__descendant inherit-font', // this is a convenience class for overriding cleanslate's element styles (like spans)
  RIGHT: 'color-wall-mode-btns__right',
  COL: 'color-wall-mode-btns__col',
  CELL: 'color-wall-mode-btns__cell'
}
interface ISelectProps {
  activeFamily?: string
  activeSection?: string
  disabled?: boolean
  options: Array<{
    label: string
  }>
  onSelectOpened?: (arg0: boolean) => void
  placeholderText: string
  onSelect: (label) => void
}

const Select = ({
  activeFamily,
  activeSection,
  placeholderText,
  options,
  disabled = false,
  onSelectOpened,
  onSelect
}: ISelectProps): JSX.Element => (
  <Wrapper
    className={'flex cursor-default h-auto relative max-w-full m-0 sm:max-w-none'}
    onMenuToggle={({ isOpen }) => onSelectOpened?.(isOpen)}
  >
    <Button
      className={
        'flex cursor-pointer h-full relative px-3 items-center justify-start w-[13.9em] text-tb normal-case font-semibold normal-case bg-buttonBgColor color-buttonColor disabled:opacity-20 tb:justify-center aria-disabled:opacity-20'
      }
      disabled={disabled}
      data-testid={`btn-${placeholderText}`}
    >
      <span className={`h-auto text-tb normal-case font-semibold aria-disabled:opacity-20`}>
        {omitPrefix(placeholderText)}
      </span>
      <FontAwesomeIcon className='!w-[10px] text-base' icon={faAngleDown} pull='right' />
    </Button>
    <Menu
      className={`w-full h-auto z-50 top-12 mt-0.5 absolute shadow-[0_2px_5px_-1px_rgba(black,0.65)] shadow-black xs:top-11 xs:left-0`}
    >
      <>
        {options.map(
          ({ label }): JSX.Element => (
            <MenuItem
              className={`h-auto opacity-95 justify-start tb:justify-center active:opacity-100 active:bg-buttonActiveBgColor active:text-buttonActiveColor`}
              key={label}
              text={omitPrefix(label)}
              value={label}
            >
              <button
                className={`inline-block text-[0.6875em] font-semibold leading-normal h-auto w-full p-2 no-underline uppercase text-left bg-white hover:bg-buttonHoverBgColor hover:text-buttonHoverColor ${
                  ((activeSection ?? activeFamily) || 'All') === label
                    ? 'h-auto text-buttonActiveColor bg-buttonActiveBgColor'
                    : menuBarInactive
                }`}
                onClick={() => {
                  onSelect(label)
                }}
                data-testid={`item-${label}`}
              >
                <span className={MODE_CLASS_NAMES.DESC}>{omitPrefix(label)}</span>
              </button>
            </MenuItem>
          )
        )}
      </>
    </Menu>
  </Wrapper>
)

interface ColorFamilyMenuBtnsProps {
  showAll?: boolean
  section: string
  families: string[]
}

const ColorFamilyMenuBtns = ({ showAll = false, families = [] }: ColorFamilyMenuBtnsProps): JSX.Element => {
  if (families.length) {
    return (
      <>
        {showAll ? (
          <ButtonBar.Button
            isActive={(match: { url: string }, location) => {
              if (!match) {
                return false
              }

              return !!location.pathname.match(new RegExp(`${match.url}/?(/color/.*)?/?$`))
            }}
            style={{
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <span className={MODE_CLASS_NAMES.DESC}>All</span>
          </ButtonBar.Button>
        ) : null}
        {families.map((name) => (
          <ButtonBar.Button
            key={name}
            onClick={null} // GA event
            style={{
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <span className={MODE_CLASS_NAMES.DESC}>{omitPrefix(name)}</span>
          </ButtonBar.Button>
        ))}
      </>
    )
  }

  return null
}

export interface IColorWallToolbarProps {
  uiStyle: string
  onSearchBtnClick: () => void
  onSubGroupBtnClick: (label: string) => void
  onGroupBtnClick: (label: string) => void
  onShowAllBtnClick: () => void
  onPrimeBtnClick: () => void
  onCloseBtnClick: () => void
  messages: {
    CLOSE?: string
    SEARCH_COLOR?: string
    VIEW_ENTIRE_COLOR_WALL?: string
    CANCEL?: string
    COLOR_FAMILIES?: string
    SELECT_COLLECTION?: string
    ALL_COLORS?: string
    EXPLORE_COLOR_FAMILIES?: string
    EXPLORE_COLLECTIONS?: string
  }
  toolBarData: {
    groups: string[]
    activeGroup: string
    subgroups: string[] | null
    activeSubgroup: string
    primeColorWall: string
  }
  toolBarConfig: { alwaysShowSubGroups: boolean; closeBtn: any; shouldShowCloseButton: boolean }
}
const ColorWallToolbar = ({
  uiStyle,
  onSearchBtnClick,
  onSubGroupBtnClick,
  onGroupBtnClick,
  onShowAllBtnClick,
  onPrimeBtnClick,
  onCloseBtnClick,
  messages,
  toolBarData,
  toolBarConfig
}: IColorWallToolbarProps): JSX.Element => {
  const {
    groups: sections,
    activeGroup: activeSection,
    subgroups: families,
    activeSubgroup: activeFamily,
    primeColorWall
  } = toolBarData
  const { alwaysShowSubGroups, closeBtn, shouldShowCloseButton } = toolBarConfig
  const { showArrow: closeBtnShowArrow = true, text: closeBtnText = messages.CLOSE } = closeBtn

  const isFamilyView: boolean = !!activeFamily
  const visibleSections: string[] = sections
  // This should have been set by staging action...
  const searchColorBtn: JSX.Element = (
    <ButtonBar.Button>
      <FontAwesomeIcon className='color-families-svg' icon={['fal', 'search']} pull='left' />
      <span className={MODE_CLASS_NAMES.DESC}>{messages.SEARCH_COLOR}</span>
    </ButtonBar.Button>
  )
  const colorFamilyMenu = useRef(null)
  if (uiStyle === 'minimal') {
    return (
      <div className={'text-base font-sans'}>
        <div className={'flex flex-wrap min-w-[300px] justify-between -mx-1 sm:max-w-none tb:justify-center'}>
          <button
            className='flex ml-0.5 min-h-[54px] min-w-[200px] items-center text-tb normal-case font-semibold cursor-pointer bg-transparent m-0 p-0'
            onClick={onSearchBtnClick}
            data-testid={TEST_ID_SEARCH}
          >
            <FontAwesomeIcon icon={faSearch} size='lg' />
            <span
              style={{
                opacity: '0.5',
                marginLeft: '15px'
              }}
            >
              {messages.SEARCH_COLOR}
            </span>
          </button>
          <Select
            disabled={families.length < 2}
            placeholderText={activeFamily || messages.EXPLORE_COLOR_FAMILIES}
            options={families
              .filter((f) => f !== activeFamily)
              .map((label) => ({
                label
              }))}
            onSelect={onSubGroupBtnClick}
            data-testid={TEST_ID_SUBGROUP}
          />
          <Select
            disabled={visibleSections.length < 2}
            placeholderText={
              activeSection === primeColorWall || !visibleSections.includes(activeSection)
                ? messages.EXPLORE_COLLECTIONS
                : activeSection
            }
            options={visibleSections
              .filter((s) => s !== activeSection)
              .map((label) => ({
                label
              }))}
            onSelect={onGroupBtnClick}
            data-testid={TEST_ID_GROUP}
          />
          <button
            className='inline-block text-right mr-5 ml-auto min-h-[54px] tb:mx-5 disabled:opacity-20 items-center text-tb normal-case font-semibold cursor-default bg-transparent p-0 tb:mx-20'
            disabled={!visibleSections.includes(primeColorWall) || (primeColorWall === activeSection && !activeFamily)}
            onClick={onShowAllBtnClick}
            data-testid={TEST_ID_VIEWALL}
          >
            {messages.VIEW_ENTIRE_COLOR_WALL}
          </button>
        </div>
      </div>
    )
  }

  return (
    <AutoSizer
      disableHeight
      style={{
        width: '100%'
      }}
    >
      {({ width }) => (
        <div className={'text-base font-sans'}>
          <div className={'flex justify-between p-2 -mx-4 sm:max-w-none'}>
            {/* Search and Family Buttons */}
            <div className={'m-0 sm:max-w-none'}>
              <ButtonBar.Bar
                style={
                  alwaysShowSubGroups
                    ? {
                        borderRadius: '0'
                      }
                    : {}
                }
              >
                {isFamilyView && !alwaysShowSubGroups ? (
                  <ButtonBar.Button>
                    <FontAwesomeIcon className='w-4' icon={['fas', 'times']} pull='left' />
                    <span className={MODE_CLASS_NAMES.DESC}>{messages.CANCEL}</span>
                  </ButtonBar.Button>
                ) : (
                  <>
                    {searchColorBtn}
                    {!alwaysShowSubGroups && families.length > 0 && (
                      <ButtonBar.Button disabled={families.length <= 1}>
                        <FontAwesomeIcon className='color-families-svg' icon={['fas', 'palette']} pull='left' />
                        <span className={MODE_CLASS_NAMES.DESC}>{messages.COLOR_FAMILIES}</span>
                      </ButtonBar.Button>
                    )}
                  </>
                )}
              </ButtonBar.Bar>
            </div>
            {/* Prime Color Wall and Collections/Families Categories Buttons */}
            {width > 768 ? (
              <>
                {visibleSections.length > 1 && (!isFamilyView || alwaysShowSubGroups) && (
                  <div className='menu-bar__border'>
                    {primeColorWall && visibleSections.includes(primeColorWall) && (
                      <button
                        className={`${menuBarPrefix}__prime-color-wall-button ${
                          primeColorWall === activeSection ? 'disabled' : ''
                        }`}
                        onClick={onPrimeBtnClick}
                      >
                        {primeColorWall}
                      </button>
                    )}
                    {(visibleSections.length > 1 || (isFamilyView && !alwaysShowSubGroups)) && (
                      <Select
                        activeSection={activeSection}
                        placeholderText={activeSection === primeColorWall ? messages.SELECT_COLLECTION : activeSection}
                        options={visibleSections
                          .filter((name) => activeFamily !== name && (!primeColorWall || primeColorWall !== name))
                          .map((label) => ({
                            label
                          }))}
                        onSelect={onGroupBtnClick}
                      />
                    )}
                  </div>
                )}
              </> // width <= 768
            ) : (
              <div
                className={`menu-bar${
                  visibleSections.length > 1 || isFamilyView || alwaysShowSubGroups ? '__border' : ''
                }
                ${visibleSections.length > 1 && alwaysShowSubGroups ? ' menu-bar__border--flex' : ''}`}
              >
                {/* Collections/Families */}
                {(visibleSections.length > 1 || (isFamilyView && !alwaysShowSubGroups)) && (
                  <Select
                    activeSection={activeSection}
                    placeholderText={
                      isFamilyView && !alwaysShowSubGroups ? activeFamily ?? messages.ALL_COLORS : activeSection
                    }
                    options={((isFamilyView || activeFamily) && !alwaysShowSubGroups ? families : visibleSections)
                      .filter(
                        (name) => activeFamily !== name && (width <= 768 || !primeColorWall || primeColorWall !== name)
                      )
                      .map((label) => ({
                        label
                      }))}
                    onSelect={onGroupBtnClick}
                  />
                )}
                {/* Families */}
                {alwaysShowSubGroups && colorFamilyMenu.current?.clientWidth > width && (
                  <>
                    {visibleSections.length > 1 && <span className='menu-bar__border' />}
                    <Select
                      activeFamily={activeFamily}
                      placeholderText={activeFamily ?? 'All'}
                      disabled={families.length < 1}
                      options={[
                        {
                          label: 'All'
                        },
                        ...families.map((label) => ({
                          label
                        }))
                      ]}
                      onSelect={onSubGroupBtnClick}
                    />
                  </>
                )}
              </div>
            )}
            {shouldShowCloseButton && (!isFamilyView || alwaysShowSubGroups) && (
              <button
                className='menu-bar__button-close'
                onClick={(e) => {
                  e.preventDefault()
                  onCloseBtnClick()
                }}
                style={
                  alwaysShowSubGroups
                    ? {
                        borderRadius: '0',
                        textTransform: 'uppercase'
                      }
                    : {}
                }
              >
                {closeBtnShowArrow && (
                  <FontAwesomeIcon className='color-families-svg' icon={['fas', 'times']} pull='left' />
                )}
                <span className={MODE_CLASS_NAMES.DESC}>{closeBtnText ?? messages.CLOSE}</span>
              </button>
            )}
            {/* Color Families Menu Bar Left Side */}
            {isFamilyView && !alwaysShowSubGroups && width > 768 && (
              <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
                <ButtonBar.Bar>
                  <ColorFamilyMenuBtns families={families} section={activeSection} />
                </ButtonBar.Bar>
              </div>
            )}
          </div>
          {/* Color Families Menu Bar Full Size */}
          {alwaysShowSubGroups && (
            <>
              {/* Color family menu measurer ref - hidden */}
              <div className='color-family-menu color-family-menu__width-size' ref={colorFamilyMenu}>
                <ColorFamilyMenuBtns showAll families={families} section={activeSection} />
              </div>
              {families && colorFamilyMenu.current?.clientWidth < width && (
                <div className='color-family-menu'>
                  <ColorFamilyMenuBtns showAll families={families} section={activeSection} />
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
