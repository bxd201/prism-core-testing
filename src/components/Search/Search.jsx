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
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import './Search.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import omitPrefix from 'src/shared/utils/omitPrefix.util'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'

const baseClass = 'Search'
const EDGE_SIZE = 15

type SearchProps = { contain?: boolean, isMobileFlexRow?: boolean }

const Search = ({ contain = false, isMobileFlexRow }: SearchProps) => {
  const { results, count, suggestions, suggestionsV2, loading } = useSelector(state => state.colors.search)
  const { items: { colorStatuses = {} } } = useSelector(state => state.colors)
  const { colorDetailPageRoot, colorWallBgColor, colorWallPageRoot } = useContext(ColorWallContext)
  const [hasSearched, updateHasSearched] = useState(typeof count !== 'undefined')
  const { brandKeyNumberSeparator }: ConfigurationContextType = useContext(ConfigurationContext)
  const suggestV2 = suggestionsV2 ? [suggestionsV2.names[0], fullColorNumber(suggestionsV2.colorNumber.brandKey, suggestionsV2.colorNumber.colorNumber, brandKeyNumberSeparator), suggestionsV2.families[0]].filter(Boolean) : null

  useEffectAfterMount(() => { updateHasSearched(true) }, [count, results, loading])

  const cellRenderer = ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }) => {
    const result = results && results[columnIndex + (rowIndex * parent.props.columnCount)]
    const mobileFlexRowContentClass = 'color-swatch__mobileFlexRowContent'

    return result && <ColorSwatch
      color={result}
      contentRenderer={(defaultContent) => isMobileFlexRow ? (
        <div className={mobileFlexRowContentClass}>
          <div>
            <p className={`color-swatch__content ${mobileFlexRowContentClass}__name`}>{result.name}</p>
            <p className={`color-swatch__content ${mobileFlexRowContentClass}__number`}>{fullColorNumber(result.brandKey, result.colorNumber, brandKeyNumberSeparator)}</p>
          </div>
          <div className={`${mobileFlexRowContentClass}__buttons`}>
            <button className={`${result.isDark ? 'dark-color' : ''}`} onClick={() => { window.location.href = colorWallPageRoot }}>Find Chip</button>
            <button className={`${result.isDark ? 'dark-color' : ''}`} onClick={() => { window.location.href = colorDetailPageRoot }}>View Color</button>
          </div>
        </div>
      ) : defaultContent}
      key={key}
      showContents
      status={colorStatuses[result.id]}
      style={style}
    />
  }

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__results-pane`}
        style={{ backgroundColor: colorWallBgColor }}>
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
                const flexRow = width <= 576 && isMobileFlexRow
                const gridWidth = width - (EDGE_SIZE * 2)
                const columnCount = flexRow ? 1 : Math.max(1, Math.round(gridWidth / 175))
                const newSize = gridWidth / columnCount
                const rowCount = Math.ceil(results.length)
                const gridHeight = contain ? height : isMobileFlexRow ? window.screen.height - 100 - (EDGE_SIZE * 2) : Math.max(height, rowCount * newSize + (EDGE_SIZE * 2))

                return (
                  <Grid
                    containerStyle={{
                      marginBotom: `${EDGE_SIZE}px`,
                      marginTop: `${EDGE_SIZE}px`
                    }}
                    cellRenderer={(props: any) => cellRenderer(flexRow ? { ...props, style: { borderWidth: '0 0 11px 0', ...props.style } } : props)}
                    columnWidth={flexRow ? gridWidth : newSize}
                    columnCount={columnCount}
                    height={gridHeight}
                    rowHeight={flexRow ? 102 : newSize}
                    rowCount={Math.ceil(results.length / columnCount)}
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
