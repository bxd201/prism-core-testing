// @flow
import React, { useContext, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from 'react-redux'
// $FlowIgnore -- no defs for react-virtualized
import { AutoSizer,Grid } from 'react-virtualized'
import Prism, { ColorSwatch } from '@prism/toolkit'
import * as GA from 'src/analytics/GoogleAnalytics'
import { colorSwatchCommonProps } from 'src/components/ColorSwatchContent/ColorSwatchContent'
import ColorWallContext, { type ColorWallContextProps } from 'src/components/Facets/ColorWall/ColorWallContext'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import ConfigurationContext, {
  type ConfigurationContextType
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'
import type { ColorsState } from 'src/shared/types/Actions'
import omitPrefix from 'src/shared/utils/omitPrefix.util'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import type { CrossSearch } from '../Facets/ColorSearchFacet/ColorSearchFacet'
import { SwatchContent } from '../Facets/ColorWall/ColorWallV3/Swatch/Swatch'
import TextButton from '../GeneralButtons/TextButton/TextButton'
import GenericMessage from '../Messages/GenericMessage'
import { GenericOverlay } from '../ToolkitComponents'
import './Search.scss'
import '../ColorSwatchContent/ColorSwatchContent.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'

const baseClass = 'Search'
const EDGE_SIZE = 15

type SearchProps = {
  closeSearch?: () => void,
  contain?: boolean,
  crossSearch?: { query?: string, searching: boolean, onSearch: () => void } & CrossSearch,
  isChipLocator?: boolean
}

const Search = ({ closeSearch = () => {}, contain = false, crossSearch, isChipLocator }: SearchProps) => {
  const { results, count, suggestions, loading, query } = useSelector((state) => state.colors.search)
  const {
    items: { colorStatuses = {} }
  }: ColorsState = useSelector((state) => state.colors)
  const {
    addButtonText,
    colorDetailPageRoot,
    colorWallBgColor,
    colorWallPageRoot,
    displayDetailsLink,
    routeType
  }: ColorWallContextProps = useContext(ColorWallContext)
  const {
    brandId,
    brandKeyNumberSeparator,
    colorWall: { colorSwatch = {} }
  }: ConfigurationContextType = useContext(ConfigurationContext)
  const { colorNumOnBottom = false, houseShaped = false } = colorSwatch
  const [hasSearched, updateHasSearched] = useState(typeof count !== 'undefined')

  useEffectAfterMount(() => {
    updateHasSearched(true)
  }, [count, results, loading])

  useEffect(() => {
    if (!query.length) {
      updateHasSearched(false)
    }
  }, [query])

  const cellRenderer = ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }: any) => {
    const result = results && results[columnIndex + rowIndex * parent.props.columnCount]
    const swatchClass = houseShaped ? 'Search--house-shaped' : 'swatch-content'
    const _style = houseShaped
      ? { ...style, width: style.width - 20, padding: '10px', textAlign: 'start' }
      : { ...style, textAlign: 'start' }

    if (!result) return

    const isSwatchEnabled = colorStatuses[result.id]?.status !== 0

    return (
      <Prism key={key}>
        <ColorSwatch
          {...colorSwatchCommonProps({ brandKeyNumberSeparator, color: result })}
          className={swatchClass}
          flagged={!isSwatchEnabled}
          {...(isChipLocator
            ? {
                // lowes valspar/hgsw qr color search
                renderer: () => {
                  return (
                    <div className={`${baseClass}__chip-locator`}>
                      <div
                        className={`${swatchClass}__label swatch-content${
                          colorNumOnBottom ? '__name-number' : '__number-name'
                        }`}
                      >
                        <p className={`${swatchClass}__label--number`}>
                          {fullColorNumber(result.brandKey, result.colorNumber, brandKeyNumberSeparator)}
                        </p>
                        <p className={`${swatchClass}__label--name`}>{result.name}</p>
                      </div>
                      <div className={`${baseClass}__chip-locator--buttons`}>
                        <button
                          className={`${baseClass}__chip-locator--buttons__button ${result.isDark ? 'dark-color' : ''}`}
                          onClick={() => {
                            GA.event(
                              {
                                category: 'QR Color Wall Search',
                                action: 'Find Chip',
                                label: `${result.name} - ${result.colorNumber}`
                              },
                              GA_TRACKER_NAME_BRAND[brandId]
                            )
                            window.location.href =
                              crossSearch && crossSearch.searching
                                ? crossSearch.onClickFindChip(result)
                                : colorWallPageRoot?.(result)
                            closeSearch()
                          }}
                        >
                          Find Chip
                        </button>
                        <button
                          className={`${baseClass}__chip-locator--buttons__button ${result.isDark ? 'dark-color' : ''}`}
                          onClick={() => {
                            GA.event(
                              {
                                category: 'QR Color Wall Search',
                                action: 'View Color',
                                label: `${result.name} - ${result.colorNumber}`
                              },
                              GA_TRACKER_NAME_BRAND[brandId]
                            )
                            window.location.href =
                              crossSearch && crossSearch.searching
                                ? crossSearch.onClickViewColor(result)
                                : colorDetailPageRoot?.(result)
                          }}
                        >
                          View Color
                        </button>
                      </div>
                    </div>
                  )
                }
              } // colorchips color wall || canada
            : addButtonText || displayDetailsLink
            ? {
                renderer: () => {
                  return (
                    <SwatchContent
                      enabled={isSwatchEnabled}
                      message={colorStatuses[result.id]?.message}
                      color={result}
                      isOnlyUsedforSearch
                    />
                  )
                }
              }
            : null)}
          style={_style}
        />
      </Prism>
    )
  }

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__results-pane`} style={{ backgroundColor: colorWallBgColor }}>
        {loading ? (
          <GenericOverlay type={GenericOverlay.TYPES.LOADING} semitransparent>
            <FormattedMessage id='SEARCH.SEARCHING' />
          </GenericOverlay>
        ) : !hasSearched ? (
          <GenericMessage type={GenericMessage.TYPES.NORMAL}>
            <FormattedMessage id='SEARCH.PROMPT' />
          </GenericMessage>
        ) : !count ? (
          <GenericMessage type={GenericMessage.TYPES.WARNING}>
            <FormattedMessage id='SEARCH.NO_RESULTS' />
            {suggestions && suggestions.length ? (
              <FormattedMessage
                id='SEARCH.SUGGESTIONS'
                values={{
                  suggestions: (
                    <>
                      {suggestions.map((suggestion, i, arr) => (
                        <React.Fragment key={i}>
                          <TextButton
                            className={routeType === 'memory' ? 'no-underline' : undefined}
                            to={routeType === 'memory' ? undefined : `./${omitPrefix(suggestion)}`}
                          >
                            {omitPrefix(suggestion)}
                          </TextButton>
                          {i < arr.length - 1 && ', '}
                        </React.Fragment>
                      ))}
                    </>
                  )
                }}
              />
            ) : null}
            {crossSearch && !crossSearch.searching ? (
              <strong>
                {crossSearch.text}{' '}
                <a
                  className={`${baseClass}__results-pane__subtitle--link`}
                  href={crossSearch.colorWallPageRoot}
                  target='_blank'
                >
                  Click Here
                </a>
              </strong>
            ) : null}
          </GenericMessage>
        ) : (
          <div
            className={`${baseClass}__results-pane__swatches ${
              contain ? `${baseClass}__results-pane__swatches--cover` : ''
            }`}
          >
            {crossSearch && (
              <p className={`${baseClass}__results-pane__subtitle`}>
                Looking for more colors?{' '}
                <a
                  className={`${baseClass}__results-pane__subtitle--link`}
                  href={crossSearch.colorWallPageRoot}
                  target='_blank'
                >
                  {`Search ${crossSearch.brand.name} colors.`}
                </a>
              </p>
            )}
            <AutoSizer disableHeight={!contain}>
              {({ height = 0, width }) => {
                const gridWidth = width - EDGE_SIZE * (houseShaped ? 0.7 : 2)
                const columnCount = Math.max(1, Math.round(gridWidth / 175))
                const newSize = gridWidth / columnCount
                const rowHeight = houseShaped ? 245 : newSize
                const rowCount = Math.ceil(results.length / columnCount)
                const gridHeight = contain ? height : Math.max(height, rowCount * newSize + EDGE_SIZE * 2)

                return (
                  <Grid
                    containerStyle={{
                      marginBotom: `${EDGE_SIZE}px`,
                      marginTop: `${EDGE_SIZE}px`
                    }}
                    cellRenderer={cellRenderer}
                    columnWidth={newSize}
                    columnCount={columnCount}
                    height={gridHeight}
                    rowHeight={rowHeight}
                    rowCount={rowCount}
                    width={width}
                  />
                )
              }}
            </AutoSizer>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
