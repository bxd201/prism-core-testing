// @flow
import React from 'react'
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
import HeroLoader from '../Loaders/HeroLoader/HeroLoader'
import './Search.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'

const baseClass = 'Search'

export default () => {
  const { results, count, suggestions, loading } = useSelector(state => state.colors.search)
  const { section, family, query } = useParams()
  const dispatch = useDispatch()

  React.useEffect(() => {
    // the api endpoint expects timeless-color/historic-color not timeless-colors/historic-colors
    const modifiedSection = section === 'timeless-colors' ? 'timeless-color' : section === 'historic-colors' ? 'historic-color' : section
    dispatch(loadSearchResults(query, family || modifiedSection))
  }, [query, family, section])

  const cellRenderer = ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }) => {
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

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__results-pane`}>
        {loading ? <HeroLoader /> : !count
          ? (
            <GenericMessage type={GenericMessage.TYPES.WARNING}>
              <FormattedMessage id='SEARCH.NO_RESULTS' />
              {suggestions && suggestions.length && (
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
              )}
            </GenericMessage>
          )
          : (
            <section className='color-wall-swatch-list color-wall-swatch-list--show-all'>
              <AutoSizer>
                {({ height, width }) => {
                  const columnCount = Math.max(1, Math.round(width / 175))
                  const newSize = width / columnCount

                  return (
                    <Grid
                      colors={results}
                      cellRenderer={cellRenderer}
                      columnWidth={newSize}
                      columnCount={columnCount}
                      height={height}
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
