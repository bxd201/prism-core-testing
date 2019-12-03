// @flow
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import memoizee from 'memoizee'
import { loadSearchResults } from '../../store/actions/loadSearchResults'
import { add } from '../../store/actions/live-palette'
import { FormattedMessage } from 'react-intl'
import { generateColorDetailsPageUrl } from '../../shared/helpers/ColorUtils'
import ColorWallSwatch from '../Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'
import GenericMessage from '../Messages/GenericMessage'
import TextButton from '../GeneralButtons/TextButton/TextButton'
import HeroLoader from '../Loaders/HeroLoader/HeroLoader'
import { type Color } from '../../shared/types/Colors'
import './Search.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'

const baseClass = 'Search'

export default () => {
  const { results: colors, count, suggestions, loading, error } = useSelector(state => state.colors.search)
  const { family, query } = useParams()
  const dispatch = useDispatch()

  React.useEffect(() => { dispatch(loadSearchResults(query, family)) }, [query, family])

  const reRunSearchWith = memoizee((newInput: string) => () => { dispatch(loadSearchResults(newInput)) })

  const cellRenderer = ({
    columnIndex, // Horizontal (column) index of cell
    isScrolling, // The Grid is currently being scrolled
    isVisible, // This cell is visible within the grid (eg it is not an overscanned cell)
    key, // Unique key within array of cells
    parent, // Reference to the parent Grid (instance)
    rowIndex, // Vertical (row) index of cell
    style // Style object to be applied to cell (to position it)
  }: Object) => {
    const columnCount = parent.props.columnCount
    const index = columnIndex + (rowIndex * columnCount)

    if (colors && colors[index]) {
      const thisColor: Color = colors[index]
      const linkToDetails: string = generateColorDetailsPageUrl(thisColor)

      return (
        <div key={key} style={style}>
          <ColorWallSwatch
            key={thisColor.hex}
            showContents
            color={thisColor}
            onAdd={add}
            detailsLink={linkToDetails}
          />
        </div>
      )
    }

    return null
  }

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__results-pane`}>
        { loading ? (
          <HeroLoader />
        ) : error ? (
          <GenericMessage type={GenericMessage.TYPES.ERROR}>
            <FormattedMessage id='SEARCH.ERROR.HEADLINE' />
            <FormattedMessage id='SEARCH.ERROR.GENERIC' />
          </GenericMessage>
        ) : !colors ? (
          <GenericMessage type={GenericMessage.TYPES.NORMAL}>
            <FormattedMessage id='SEARCH.PROMPT' />
          </GenericMessage>
        ) : !count ? (
          <GenericMessage type={GenericMessage.TYPES.WARNING}>
            <FormattedMessage id='SEARCH.NO_RESULTS' />
            {suggestions && suggestions.length ? (
              <FormattedMessage id='SEARCH.SUGGESTIONS' values={{ suggestions: (() => <React.Fragment>
                {suggestions.map((suggestion, i, arr) => <React.Fragment key={i}>
                  <TextButton onClick={reRunSearchWith(suggestion)}>{suggestion}</TextButton>
                  {i < arr.length - 1 ? ', ' : null}
                </React.Fragment>
                )}
              </React.Fragment>)() }} />
            ) : null }
          </GenericMessage>
        ) : (
          <section className='color-wall-swatch-list color-wall-swatch-list--show-all'>
            <AutoSizer>
              {({ height, width }) => {
                const columnCount = Math.max(1, Math.round(width / 175))
                const rowCount = Math.ceil(colors.length / columnCount)
                const newSize = width / columnCount

                return (
                  <Grid
                    colors={colors}
                    cellRenderer={cellRenderer}
                    columnWidth={newSize}
                    columnCount={columnCount}
                    height={height}
                    rowHeight={newSize}
                    rowCount={rowCount}
                    width={width}
                  />
                )
              }}
            </AutoSizer>
          </section>
        ) }
      </div>
    </div>
  )
}
