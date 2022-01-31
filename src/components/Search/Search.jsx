// @flow
import React, { useContext, useState } from 'react'
import { useSelector } from 'react-redux'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import { FormattedMessage } from 'react-intl'
import ColorSwatch from 'src/components/Facets/ColorWall/ColorSwatch/ColorSwatch'
import GenericMessage from '../Messages/GenericMessage'
import TextButton from '../GeneralButtons/TextButton/TextButton'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'
import ColorWallContext, { type ColorWallContextProps } from 'src/components/Facets/ColorWall/ColorWallContext'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import './Search.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import omitPrefix from 'src/shared/utils/omitPrefix.util'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'

const baseClass = 'Search'
const EDGE_SIZE = 15

type SearchProps = { closeSearch?: () => void, contain?: boolean, isChipLocator?: boolean }

const Search = ({ closeSearch = () => {}, contain = false, isChipLocator }: SearchProps) => {
  const { results, count, suggestions, loading } = useSelector(state => state.colors.search)
  const { items: { colorStatuses = {} } } = useSelector(state => state.colors)
  const { colorDetailPageRoot, colorWallBgColor, colorWallPageRoot, routeType }: ColorWallContextProps = useContext(ColorWallContext)

  const [hasSearched, updateHasSearched] = useState(typeof count !== 'undefined')
  const { brandId, brandKeyNumberSeparator }: ConfigurationContextType = useContext(ConfigurationContext)

  useEffectAfterMount(() => { updateHasSearched(true) }, [count, results, loading])

  const cellRenderer = ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }) => {
    const result = results && results[columnIndex + (rowIndex * parent.props.columnCount)]

    return result && <ColorSwatch
      color={result}
      contentRenderer={(defaultContent) => isChipLocator ? (
        <>
          <p className='color-swatch__chip-locator__name'>{result.name}</p>
          <p className='color-swatch__chip-locator__number'>{fullColorNumber(result.brandKey, result.colorNumber, brandKeyNumberSeparator)}</p>
          <div className='color-swatch__chip-locator--buttons' style={{ bottom: '0.6rem' }}>
            <button
              className={`color-swatch__chip-locator--buttons__button ${result.isDark ? 'dark-color' : ''}`}
              onClick={() => {
                GA.event({ category: 'QR Color Wall Search', action: 'Find Chip', label: `${result.name} - ${result.colorNumber}` }, GA_TRACKER_NAME_BRAND[brandId])
                window.location.href = colorWallPageRoot?.(result)
                closeSearch()
              }}
            >
              Find Chip
            </button>
            <button
              className={`color-swatch__chip-locator--buttons__button ${result.isDark ? 'dark-color' : ''}`}
              onClick={() => {
                GA.event({ category: 'QR Color Wall Search', action: 'View Color', label: `${result.name} - ${result.colorNumber}` }, GA_TRACKER_NAME_BRAND[brandId])
                window.location.href = colorDetailPageRoot?.(result)
              }}
            >
              View Color
            </button>
          </div>
        </>
      ) : defaultContent}
      key={key}
      showContents
      status={colorStatuses[result.id]}
      style={style}
    />
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
              <FormattedMessage id='SEARCH.SUGGESTIONS' values={{ suggestions: (
                <>
                  {suggestions.map((suggestion, i, arr) =>
                    <React.Fragment key={i}>
                      <TextButton className={routeType === 'memory' ? 'no-underline' : undefined} to={routeType === 'memory' ? undefined : `./${omitPrefix(suggestion)}`}>
                        {omitPrefix(suggestion)}
                      </TextButton>
                      {i < arr.length - 1 && ', '}
                    </React.Fragment>
                  )}
                </>
              ) }} />
            ) : null}
          </GenericMessage>
        ) : (
          <div className={`${baseClass}__results-pane__swatches ${contain ? `${baseClass}__results-pane__swatches--cover` : ''}`}>
            <AutoSizer disableHeight={!contain}>
              {({ height = 0, width }) => {
                const gridWidth = width - (EDGE_SIZE * 2)
                const columnCount = Math.max(1, Math.round(gridWidth / 175))
                const newSize = gridWidth / columnCount
                const rowCount = Math.ceil(results.length / columnCount)
                const gridHeight = contain ? height : Math.max(height, rowCount * newSize + (EDGE_SIZE * 2))

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
                    rowHeight={newSize}
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
