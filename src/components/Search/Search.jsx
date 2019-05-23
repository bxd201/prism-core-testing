// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import debounce from 'lodash/debounce'

import { loadSearchResults, clearSearch } from '../../store/actions/loadSearchResults'
import { add } from '../../store/actions/live-palette'

import { FormattedMessage } from 'react-intl'

import { generateColorDetailsPageUrl } from '../../shared/helpers/ColorUtils'

import ColorWallSwatch from '../Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'
import SearchBar from './SearchBar'
import ButtonBar from '../ButtonBar/ButtonBar'
import GenericMessage from '../Messages/GenericMessage'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'

import { type Color } from '../../shared/types/Colors'

import './Search.scss'

type Props = {
  colors: void | any[],
  loading: Boolean,
  loadSearchResults: Function,
  clearSearch: Function,
  addToLivePalette: Function,
  onCancel: Function
}

type State = {
  resultSwatchSize: number // TODO: watch for resize and adjust this accordingly to maintain desired range of sizes
}

const SEARCH_DELAY = 500
const baseClass = 'Search'

export class Search extends PureComponent<Props, State> {
  state = {
    resultSwatchSize: 175
  }

  searchComponent: RefObject

  constructor (props: Props) {
    super(props)

    this.searchComponent = React.createRef()
    this.doClearSearch = this.doClearSearch.bind(this)
    this.cellRenderer = this.cellRenderer.bind(this)
  }

  render () {
    const { colors, onCancel, loading } = this.props
    const { resultSwatchSize } = this.state

    return (
      <div className={baseClass}>
        <form onSubmit={this.handleSubmit} className={`${baseClass}__search-form`}>
          <SearchBar onSearchInput={this.performSearch} onClearSearch={this.doClearSearch} ref={this.searchComponent} />
          <ButtonBar.Bar>
            <ButtonBar.Button onClick={onCancel}>
              <FormattedMessage id='CANCEL' />
            </ButtonBar.Button>
          </ButtonBar.Bar>
        </form>
        <div className={`${baseClass}__results-pane`}>
          { loading ? (
            <CircleLoader />
          ) : !colors ? (
            <GenericMessage type={GenericMessage.TYPES.NORMAL}>
              <FormattedMessage id='SEARCH_PROMPT' />
            </GenericMessage>
          ) : !colors.length ? (
            <GenericMessage type={GenericMessage.TYPES.WARNING}>
              <FormattedMessage id='SEARCH_NO_RESULTS' />
            </GenericMessage>
          ) : (
            <section className='color-wall-swatch-list color-wall-swatch-list--show-all'>
              <AutoSizer>
                {({ height, width }) => {
                  const columnCount = Math.round(width / resultSwatchSize)
                  const rowCount = Math.ceil(colors.length / columnCount)
                  const newSize = width / columnCount
                  return (
                    <Grid
                      colors={colors}
                      cellRenderer={this.cellRenderer}
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

  componentDidMount () {
    // clear search results whenever this component mounts -- this is how we control our initial "enter a color name" state
    this.props.clearSearch()
  }

  performSearch = debounce((value: string) => {
    this.props.loadSearchResults(value)
  }, SEARCH_DELAY)

  handleSubmit = (e: SyntheticInputEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  doClearSearch = () => {
    this.props.clearSearch()

    // if our search component has a focus method per its exposed API...
    if (typeof this.searchComponent.current[SearchBar.API.focus] === 'function') {
      // ... call it after clearing search
      this.searchComponent.current[SearchBar.API.focus]()
    }
  }

  cellRenderer = function cellRenderer ({
    columnIndex, // Horizontal (column) index of cell
    isScrolling, // The Grid is currently being scrolled
    isVisible, // This cell is visible within the grid (eg it is not an overscanned cell)
    key, // Unique key within array of cells
    parent, // Reference to the parent Grid (instance)
    rowIndex, // Vertical (row) index of cell
    style // Style object to be applied to cell (to position it)
  }: Object) {
    const { colors, addToLivePalette } = this.props
    const { props: { columnCount } } = parent

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
            onAdd={addToLivePalette}
            detailsLink={linkToDetails}
          />
        </div>
      )
    }

    return null
  }
}

const mapStateToProps = (state, props) => {
  return {
    colors: state.colors.search.results,
    loading: state.colors.search.loading
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    clearSearch: () => {
      dispatch(clearSearch())
    },
    loadSearchResults: (family) => {
      dispatch(loadSearchResults(family))
    },
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
