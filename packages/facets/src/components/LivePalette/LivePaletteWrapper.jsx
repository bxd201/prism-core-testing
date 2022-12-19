// @flow
import React, { useContext, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Prism, { ColorsIcon, LivePalette } from '@prism/toolkit'
import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import startCase from 'lodash/startCase'
import values from 'lodash/values'
import '../../providers/fontawesome/fontawesome'
import * as GA from '../../analytics/GoogleAnalytics'
import { LP_MAX_COLORS_ALLOWED, MIN_COMPARE_COLORS_ALLOWED } from '../../constants/configurations'
import { GA_TRACKER_NAME_BRAND, HASH_CATEGORIES } from '../../constants/globals'
import ConfigurationContext, {
  type ConfigurationContextType
} from '../../contexts/ConfigurationContext/ConfigurationContext'
import { fullColorName, fullColorNumber } from '../../shared/helpers/ColorUtils'
import {
  activate,
  deactivateTemporaryColor,
  empty,
  replaceLpColors,
  toggleCompareColor
} from '../../store/actions/live-palette'
import { loadColors, showColorDetailsModal } from '../../store/actions/loadColors'
import {
  navigateToIntendedDestination,
  setNavigationIntent,
  setNavigationIntentWithReturn
} from '../../store/actions/navigation'
import { ROUTES_ENUM } from '../Facets/ColorVisualizerWrapper/routeValueCollections'
import LivePaletteModal from './LivePaletteModal'
import './LivePalette.scss'

const PATH__NAME = 'fast-mask-simple.html'
const baseClass = 'prism-live-palette'
const slotClass = `${baseClass}__slot`

const LivePaletteWrapper = ({ routeType, simple = false }: { routeType?: string, simple?: boolean }) => {
  const dispatch = useDispatch()
  const colorMap = useSelector((state) => state.colors.items.colorMap, shallowEqual)
  const { activeColor, colors: lpColors, temporaryActiveColor } = useSelector((state) => state.lp)
  const {
    brandId,
    brandKeyNumberSeparator,
    colorWall: { colorSwatch = {} },
    cvw = {},
    allowedAnalytics
  } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { colorNumOnBottom = false, houseShaped = false, infoBtn = {} } = colorSwatch
  const { compare, firstEmptySlot, title } = cvw.palette ?? {}
  const [isCompareColor, setIsCompareColor] = useState(false)
  const [isFastMaskPage, setIsFastMaskPage] = useState(false)
  const [spokenWord, setSpokenWord] = useState(false)
  const { formatMessage } = useIntl()

  useEffect(() => {
    loadColors(brandId)(dispatch)
    // Resets navigation intended destination
    dispatch(navigateToIntendedDestination())

    if (window.location.pathname.split('/').slice(-1)[0] === PATH__NAME) {
      setIsFastMaskPage(true)
    }
  }, [])

  const setNavigationIntents = (shouldGoTo: string, shouldReturnTo?: string) => {
    shouldGoTo && shouldReturnTo
      ? dispatch(setNavigationIntentWithReturn(shouldGoTo, shouldReturnTo))
      : dispatch(setNavigationIntent(shouldGoTo))
  }

  return (
    <div className={`${baseClass}${simple ? '-simple' : ''}`}>
      <LivePaletteModal
        // TODO: fix deactivateTemporaryColor with correct argument or set is as optional
        cancel={() => dispatch(deactivateTemporaryColor())}
        empty={() => dispatch(empty())}
        isActive={temporaryActiveColor !== null}
      />
      {!simple && (
        <div className={`${baseClass}__header`}>
          <span className={`${baseClass}__header__name`}>{title ?? <FormattedMessage id='PALETTE_TITLE' />}</span>
          {lpColors.length >= MIN_COMPARE_COLORS_ALLOWED && (
            <button
              tabIndex='-1'
              className={`${baseClass}__header__compare-button${isFastMaskPage ? '--hide' : ''}`}
              onClick={() => {
                setIsCompareColor(!isCompareColor)
                dispatch(toggleCompareColor())
              }}
            >
              {compare ?? <FormattedMessage id='COMPARE_COLORS' />}
            </button>
          )}
        </div>
      )}
      <Prism className='flex-1'>
        <LivePalette
          activeIndex={lpColors.findIndex(({ id }) => id === activeColor.id)}
          addButtonRenderer={(colors) => {
            const IS_EMPTY = colors.length === 0
            const ADD_COLOR_TEXT = IS_EMPTY ? 'FIND_COLORS_IN_CW' : 'ADD_A_COLOR'

            return (
              <button
                className={slotClass}
                onClick={() => {
                  window.location[routeType === 'browser' ? 'pathname' : 'hash'].split('/').pop() ===
                  ROUTES_ENUM.ACTIVE.substr(1)
                    ? setNavigationIntents(ROUTES_ENUM.COLOR_WALL, ROUTES_ENUM.ACTIVE)
                    : setNavigationIntents(ROUTES_ENUM.COLOR_WALL)
                }}
              >
                <div className={`flex justify-center items-center ${IS_EMPTY ? '' : 'flex-col'}`}>
                  <FontAwesomeIcon className={`${slotClass}__icon`} icon={['fal', 'plus-circle']} size='2x' />
                  <p className={`${slotClass}__label ${IS_EMPTY ? 'text-left' : ''}`}>
                    {firstEmptySlot && IS_EMPTY ? (
                      <p className={`${slotClass}__label--text`}>{firstEmptySlot}</p>
                    ) : (
                      <FormattedMessage
                        id={ADD_COLOR_TEXT}
                        values={{
                          line: (chunk) => (
                            <>
                              <span style={{ display: 'inline-block' }}>{chunk}</span>
                              <br />
                            </>
                          )
                        }}
                      />
                    )}
                  </p>
                </div>
              </button>
            )
          }}
          colors={lpColors}
          className={`${baseClass}__height${houseShaped ? ` ${baseClass}-house-shaped__height` : ''}`}
          deleteButtonRenderer={({ name }, onClick) =>
            colorMap &&
            !simple && (
              <button
                aria-label={formatMessage({ id: 'LIVE_PALETTE_REMOVE' }, { colorName: name })}
                className={`${baseClass}__trash`}
                onClick={() => {
                  onClick()
                  setSpokenWord(`${name} has been removed.`)
                }}
              >
                <FontAwesomeIcon className={`${baseClass}__trash--icon`} icon={['fa', 'trash']} size='1x' />
              </button>
            )
          }
          detailsButtonRenderer={(color) => {
            const { brandKey, colorNumber, coordinatingColors, name } = color

            return (
              colorMap &&
              !simple && (
                <button
                  className={`${baseClass}__info`}
                  onClick={() => {
                    dispatch(showColorDetailsModal(color))
                    // Reset app scroll top position for hosts with big headers
                    setTimeout(() => {
                      const container = document.getElementById('cvw-container')
                      const position = container && container.getBoundingClientRect()
                      window.scroll({ top: position?.top })
                    }, 250)
                    GA.event(
                      {
                        category: startCase(
                          window.location.hash.split('/').filter((hash) => HASH_CATEGORIES.indexOf(hash) >= 0)
                        ),
                        action: 'Color Swatch Info',
                        label: fullColorName(brandKey, colorNumber, name, brandKeyNumberSeparator)
                      },
                      GA_TRACKER_NAME_BRAND[brandId]
                    )
                  }}
                >
                  {infoBtn.icon ? (
                    <FontAwesomeIcon icon={['fal', infoBtn.icon]} />
                  ) : (
                    <ColorsIcon
                      aria-label={`${name} ${formatMessage({ id: 'COLOR_DETAILS' })}`}
                      className='w-5 h-5'
                      hexes={filter(colorMap, (c) => values(coordinatingColors).some((id) => id === c.id)).map(
                        (c) => c.hex
                      )}
                      infoIcon={
                        <div className={`${baseClass}__info--outlined`}>
                          <FontAwesomeIcon className={`${baseClass}__info--outlined-icon`} icon={['fas', 'info']} />
                        </div>
                      }
                    />
                  )}
                </button>
              )
            )
          }}
          draggable={!simple}
          emptySlotRenderer={() => (
            <div className={`${slotClass}--empty`}>
              <FontAwesomeIcon
                className={`${slotClass}__icon ${slotClass}__icon--empty`}
                icon={['fal', 'plus-circle']}
                size='2x'
              />
            </div>
          )}
          labelRenderer={({ brandKey, colorNumber, name, isDark }) => {
            const condActiveColorClass = houseShaped ? `${baseClass}-house-shaped` : baseClass

            return (
              <div className={colorNumOnBottom ? `${condActiveColorClass}__name-number` : ''}>
                <span className={`${condActiveColorClass}__color-number`}>
                  {fullColorNumber(brandKey, colorNumber)}
                </span>
                <span className={`${condActiveColorClass}__color-name`}>{name}</span>
              </div>
            )
          }}
          maxSlots={LP_MAX_COLORS_ALLOWED}
          onColorActivated={(color) => {
            dispatch(activate(color))
            setSpokenWord(`${color?.name} has been activated.`)
          }}
          onColorsChanged={(colors) => {
            !isEqual(colors, lpColors) && dispatch(replaceLpColors(colors))
          }}
          slotAriaLabel={({ name }) => `Expand option for ${name} color`}
        />
      </Prism>
      {/* Speaks the activated and removed color slot name */}
      <aside aria-live='assertive' className={`${baseClass}__color-description`}>
        {spokenWord}
      </aside>
    </div>
  )
}

export default LivePaletteWrapper
