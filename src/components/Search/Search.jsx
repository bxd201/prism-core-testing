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
import kebabCase from 'lodash/kebabCase'
import { fullColorName, fullColorNumber, generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'

const baseClass = 'Search'
const EDGE_SIZE = 15

type SearchProps = { contain?: boolean, isChipLocator?: boolean }

const Search = ({ contain = false, isChipLocator }: SearchProps) => {
  const { results, count, suggestions, suggestionsV2, loading } = useSelector(state => state.colors.search)
  const { items: { colorStatuses = {} } } = useSelector(state => state.colors)
  const { colorDetailPageRoot, colorWallBgColor, colorWallChunkPageRoot }: ColorWallContextProps = useContext(ColorWallContext)

  const [hasSearched, updateHasSearched] = useState(typeof count !== 'undefined')
  const { brandKeyNumberSeparator }: ConfigurationContextType = useContext(ConfigurationContext)
  const suggestV2 = suggestionsV2 ? [suggestionsV2.names[0], fullColorNumber(suggestionsV2.colorNumber.brandKey, suggestionsV2.colorNumber.colorNumber, brandKeyNumberSeparator), suggestionsV2.families[0]].filter(Boolean) : null

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
              className={`color-swatch__chip-locator--buttons__button${result.isDark ? ' dark-color' : ''}`}
              onClick={() => {
                colorWallChunkPageRoot && (window.location.href = `${colorWallChunkPageRoot}#${generateColorWallPageUrl(result.colorGroup, undefined, result.id, fullColorName(result.brandKey, result.colorNumber, result.name))}`)
              }}
            >
                Find Chip
            </button>
            <button
              className={`color-swatch__chip-locator--buttons__button${result.isDark ? ' dark-color' : ''}`}
              onClick={() => {
                colorDetailPageRoot && (window.location.href = `${colorDetailPageRoot}${result.colorFamilyNames[0]}/${kebabCase(result.name + result.brandKey)}-${result.colorNumber}`)
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
            {suggestV2 && suggestV2.length ? (
              <FormattedMessage id='SEARCH.SUGGESTIONS' values={{ suggestions: (
                <>
                  {suggestV2.map((suggestion, i, arr) =>
                    <React.Fragment key={i}>
                      <TextButton to={`./${omitPrefix(suggestV2[i])}`}>
                        {omitPrefix(suggestV2[i])}
                      </TextButton>
                      {i < arr.length - 1 && ', '}
                    </React.Fragment>
                  )}
                </>
              ) }} />
            ) : null }
            {!suggestV2 && !suggestV2.length && suggestions && suggestions.length ? (
              <FormattedMessage id='SEARCH.SUGGESTIONS' values={{ suggestions: (
                <>
                  {suggestions.map((suggestion, i, arr) =>
                    <React.Fragment key={i}>
                      <TextButton to={`./${omitPrefix(suggestion)}`}>
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
