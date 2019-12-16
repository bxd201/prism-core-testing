// @flow
import React, { useContext, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import { loadSearchResults } from '../../store/actions/loadSearchResults'
import { add } from '../../store/actions/live-palette'
import { FormattedMessage } from 'react-intl'
import ColorWallSwatch from '../Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'
import GenericMessage from '../Messages/GenericMessage'
import TextButton from '../GeneralButtons/TextButton/TextButton'
// import HeroLoader from '../Loaders/HeroLoader/HeroLoader'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import './Search.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
// hijacking the styles of another component to use its internal wrapper class here
// TODO: do NOT do this. extract the relevant portion out inton its own component so you can include it normally here and elsewhere.
import 'src/components/Facets/ColorWall/ColorWallSwatchList.scss'
import { compareKebabs } from '../../shared/helpers/StringUtils'

const baseClass = 'Search'
const EDGE_SIZE = 15

type Props = {
  contain?: boolean,
  limitSearchToFamily?: boolean
}

const Search = (props: Props) => {
  const { limitSearchToFamily = false, contain = false } = props
  const { results, count, suggestions, loading } = useSelector(state => state.colors.search)
  const { structure } = useSelector(state => state.colors)
  const { section, family, query } = useParams()
  const dispatch = useDispatch()
  const { colorWallBgColor } = useContext(ColorWallContext)
  const [hasSearched, updateHasSearched] = useState(false)

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

  useEffectAfterMount(() => {
    updateHasSearched(true)
  }, [count, results, loading])

  const cellRenderer = useMemo(() => {
    return ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }) => {
      const columnCount = parent.props.columnCount
      const index = columnIndex + (rowIndex * columnCount)

      return results && results[index] && (
        <div key={key} style={style}>
          <ColorWallSwatch
            key={results[index].hex}
            showContents
            color={results[index]}
            onAdd={add}
          />
        </div>
      )
    }
  }, [results])

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__results-pane ${!contain ? `${baseClass}__results-pane--top-align` : ''}`}
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
          <section className={`color-wall-swatch-list ${contain ? 'color-wall-swatch-list--cover' : ''}`}>
            <AutoSizer disableHeight={!contain}>
              {({ height = 0, width }) => {
                const gridWidth = width - (EDGE_SIZE * 2)
                const columnCount = Math.max(1, Math.round(gridWidth / 175))
                const newSize = gridWidth / columnCount
                const rowCount = Math.ceil(results.length / columnCount)
                const gridHeight = contain ? height : Math.max(height, rowCount * newSize + (EDGE_SIZE * 2))

                return (
                  <Grid
                    containerStyle={{ margin: `${EDGE_SIZE}px auto` }}
                    colors={results}
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
          </section>
        )}
      </div>
    </div>
  )
}

export default Search
