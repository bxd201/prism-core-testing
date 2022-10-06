import React, { useState } from 'react'
import { AutoSizer } from 'react-virtualized'
import { faSearch } from '@fortawesome/pro-light-svg-icons'
import { faPalette, faTimes } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ButtonBar from './button-bar'
import ColorFamilyMenuBtns from './color-family-menu-btns'
import Select from './select'

export const TEST_ID_SEARCH = 'search-btn'
export const TEST_ID_SUBGROUP = 'subgroup-btn'
export const TEST_ID_GROUP = 'group-btn'
export const TEST_ID_VIEWALL = 'view-all-btn'

export interface IColorWallToolbarProps {
  uiStyle: 'minimal' | null
  onSearchBtnClick: () => void
  onSubGroupBtnClick: (label: string) => void
  onGroupBtnClick: (label: string) => void
  onShowAllBtnClick: () => void
  onPrimeBtnClick: () => void
  onCloseBtnClick: () => void
  messages?: {
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
  const [isFamilyView, setIsFamilyView] = useState(false)

  const toggleFamilyView = (): void => {
    setIsFamilyView(!isFamilyView)
  }

  const SearchColorBtn: JSX.Element = (
    <ButtonBar.Button>
      <FontAwesomeIcon className='color-families-svg' icon={faSearch} size='lg' pull='left' />
      <span>{messages.SEARCH_COLOR}</span>
    </ButtonBar.Button>
  )

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
            uiStyle={uiStyle}
          />
          <Select
            disabled={sections.length < 2}
            placeholderText={
              activeSection === primeColorWall || !sections.includes(activeSection)
                ? messages.EXPLORE_COLLECTIONS
                : activeSection
            }
            options={sections
              .filter((s) => s !== activeSection)
              .map((label) => ({
                label
              }))}
            onSelect={onGroupBtnClick}
            uiStyle={uiStyle}
            data-testid={TEST_ID_GROUP}
          />
          <button
            className='inline-block text-right mr-5 ml-auto min-h-[54px] tb:mx-5 disabled:opacity-20 items-center text-tb normal-case font-semibold cursor-default bg-transparent p-0 tb:mx-20'
            disabled={primeColorWall === activeSection && !activeFamily}
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
              <ButtonBar.Bar style={alwaysShowSubGroups ? { borderRadius: '0' } : {}}>
                {isFamilyView && !alwaysShowSubGroups ? (
                  <ButtonBar.Button onClick={toggleFamilyView} isActive={true}>
                    <FontAwesomeIcon className='w-4' icon={faTimes} size='lg' pull='left' />
                    <span>{messages.CANCEL}</span>
                  </ButtonBar.Button>
                ) : (
                  <>
                    {SearchColorBtn}
                    {!alwaysShowSubGroups && (
                      <ButtonBar.Button disabled={families.length <= 1} onClick={toggleFamilyView}>
                        <FontAwesomeIcon className='color-families-svg' icon={faPalette} pull='left' />
                        <span>{messages.COLOR_FAMILIES}</span>
                      </ButtonBar.Button>
                    )}
                  </>
                )}
              </ButtonBar.Bar>
            </div>
            {/* Prime Color Wall and Collections/Families Categories Buttons */}
            {width > 768 ? (
              <>
                {sections.length > 1 && (!isFamilyView || alwaysShowSubGroups) && (
                  <div className='flex border-solid border border-buttonBorderColor'>
                    {primeColorWall && sections.includes(primeColorWall) && (
                      <button
                        className={
                          'bg-buttonBgColor text-buttonColor px-3 border-r border-solid border-buttonBorderColor no-underline min-h-[38px] leading-[38px] disabled:bg-buttonActiveBgColor disabled:text-buttonActiveColor hover:bg-buttonHoverBgColor hover:text-buttonHoverColor'
                        }
                        disabled={primeColorWall === activeSection}
                        onClick={onPrimeBtnClick}
                      >
                        {primeColorWall}
                      </button>
                    )}
                    {(sections.length > 1 || (isFamilyView && !alwaysShowSubGroups)) && (
                      <Select
                        activeSection={activeSection}
                        placeholderText={activeSection === primeColorWall ? messages.SELECT_COLLECTION : activeSection}
                        options={sections
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
                className={`${
                  sections.length > 1 || isFamilyView
                    ? 'flex border-solid border border-buttonBorderColor'
                    : 'flex h-auto cursor-default relative'
                }`}
              >
                {/* Collections/Families */}
                {(sections.length > 1 || (isFamilyView && !alwaysShowSubGroups)) && (
                  <Select
                    activeSection={activeSection}
                    placeholderText={
                      isFamilyView && !alwaysShowSubGroups ? activeFamily ?? messages.ALL_COLORS : activeSection
                    }
                    options={((isFamilyView || activeFamily) && !alwaysShowSubGroups ? families : sections)
                      .filter(
                        (name) => activeFamily !== name && (width <= 768 || !primeColorWall || primeColorWall !== name)
                      )
                      .map((label) => ({
                        label
                      }))}
                    onSelect={onGroupBtnClick}
                  />
                )}
              </div>
            )}
            {shouldShowCloseButton && !isFamilyView && (
              <button
                className='menu-bar__button-close'
                onClick={(e) => {
                  e.preventDefault()
                  onCloseBtnClick()
                }}
                style={alwaysShowSubGroups ? { borderRadius: '0', textTransform: 'uppercase' } : {}}
              >
                {closeBtnShowArrow && (
                  <FontAwesomeIcon className='color-families-svg' icon={['fas', 'times']} pull='left' />
                )}
                <span>{closeBtnText ?? messages.CLOSE}</span>
              </button>
            )}
            {/* Color Families Menu Bar Right Side */}
            {isFamilyView && !alwaysShowSubGroups && width > 768 && (
              <div className={`m-0 max-w-none`}>
                <ButtonBar.Bar>
                  <ColorFamilyMenuBtns
                    families={families}
                    section={activeSection}
                    onClick={onSubGroupBtnClick}
                    activeFamily={activeFamily}
                  />
                </ButtonBar.Bar>
              </div>
            )}
          </div>
        </div>
      )}
    </AutoSizer>
  )
}

export default ColorWallToolbar
