// @flow
import React, { useContext, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import { loadSearchResults } from '../../store/actions/loadSearchResults'
import { FormattedMessage } from 'react-intl'
import ColorSwatch from 'src/components/Facets/ColorWall/ColorSwatch/ColorSwatch'
import GenericMessage from '../Messages/GenericMessage'
import TextButton from '../GeneralButtons/TextButton/TextButton'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import './Search.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import { compareKebabs } from '../../shared/helpers/StringUtils'

const baseClass = 'Search'
const EDGE_SIZE = 15

type SearchProps = { contain?: boolean, limitSearchToFamily?: boolean }
const Search = ({ limitSearchToFamily = false, contain = false }: SearchProps) => {
  const { results, count, suggestions, loading } = useSelector(state => state.colors.search)
  const { structure, items: { colorStatuses = {} } } = useSelector(state => state.colors)
  const { section, family, query } = useParams()
  const dispatch = useDispatch()
  const { colorWallBgColor } = useContext(ColorWallContext)
  const [hasSearched, updateHasSearched] = useState(typeof count !== 'undefined')

  React.useEffect(() => {
    if (limitSearchToFamily) {
      if (family) {
        dispatch(loadSearchResults(query, family))
        return
      }

      if (section) {
        const familiesFromSection = structure.filter(v => compareKebabs(v.name, section)).map(v => v.families)

        if (familiesFromSection && familiesFromSection.length === 1) {
          dispatch(loadSearchResults(query, familiesFromSection[0]))
          return
        }
      }
    }

    dispatch(loadSearchResults(query))
  }, [query, family, section, limitSearchToFamily])

  useEffectAfterMount(() => { updateHasSearched(true) }, [count, results, loading])

  const cellRenderer = ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }) => {
    const result = results && results[columnIndex + (rowIndex * parent.props.columnCount)]
    return result && <ColorSwatch key={key} style={style} color={result} status={colorStatuses[result.id]} showContents />
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
            {suggestions && suggestions.length ? (
              <FormattedMessage id='SEARCH.SUGGESTIONS' values={{ suggestions: (
                <>
                  {suggestions.map((suggestion, i, arr) =>
                    <React.Fragment key={i}>
                      <TextButton to={`./${suggestion}`}>
                        {suggestion}
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
