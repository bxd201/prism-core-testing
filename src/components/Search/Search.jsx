// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import debounce from 'lodash/debounce'
import memoizee from 'memoizee'

import { loadSearchResults, clearSearch, updateSearchQuery } from '../../store/actions/loadSearchResults'
import { add } from '../../store/actions/live-palette'

import { FormattedMessage } from 'react-intl'

import { generateColorDetailsPageUrl } from '../../shared/helpers/ColorUtils'

import ColorWallSwatch from '../Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'
import SearchBar from './SearchBar'
import ButtonBar from '../GeneralButtons/ButtonBar/ButtonBar'
import GenericMessage from '../Messages/GenericMessage'
import TextButton from '../GeneralButtons/TextButton/TextButton'

import { type Color } from '../../shared/types/Colors'

import './Search.scss'
import HeroLoader from '../Loaders/HeroLoader/HeroLoader'

type Props = {
  colors: void | any[],
  count: number,
  suggestions: void | string[],
  loading: boolean,
  error: boolean,
  loadSearchResults: Function,
  updateSearchQuery: Function,
  clearSearch: Function,
  addToLivePalette: Function,
  onCancel: Function,
  query: string
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
    // this.doClearSearch = this.doClearSearch.bind(this)
    this.cellRenderer = this.cellRenderer.bind(this)
    this.reRunSearchWith = this.reRunSearchWith.bind(this)
    this.handleUpdateSearchQuery = this.handleUpdateSearchQuery.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  render () {
    const { colors, loading, count, suggestions, error, query } = this.props
    const { resultSwatchSize } = this.state

    return (
      <div className={baseClass}>
        <form onSubmit={this.handleSubmit} className={`${baseClass}__search-form`}>
          <SearchBar onSearchInput={this.handleUpdateSearchQuery} value={query} onClearSearch={this.doClearSearch} ref={this.searchComponent} />
          <ButtonBar.Bar>
            <ButtonBar.Button onClick={this.handleCancel}>
              <FormattedMessage id='CANCEL' />
            </ButtonBar.Button>
          </ButtonBar.Bar>
        </form>
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
                    <TextButton onClick={this.reRunSearchWith(suggestion)}>{suggestion}</TextButton>
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
                  const columnCount = Math.max(1, Math.round(width / resultSwatchSize))
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

  componentDidMount = () => {
    const { loadSearchResults, query } = this.props
    // if we have a search term when the component mounts, go ahead and re-run the search
    // this SHOULD be cached so it shouldn't really be a big deal
    // it ensures that we can actually get search results upon navigating straight to the page
    if (query) {
      loadSearchResults(query)
    }
  }

  handleCancel = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.props.onCancel()
  }

  handleUpdateSearchQuery = (query: string) => {
    this.props.updateSearchQuery(query)
    this.performSearch(query)
  }

  performSearch = debounce((value?: string) => {
    this.props.loadSearchResults(value)
  }, SEARCH_DELAY)

  handleSubmit = (e: SyntheticInputEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  doClearSearch = () => {
    this.props.clearSearch()

    // if our search component has a focus method per its exposed API...
    if (this.searchComponent.current) {
      // ... call it after clearing search
      this.searchComponent.current.focus()
    }
  }

  reRunSearchWith = memoizee((newInput: string) => () => {
    this.props.loadSearchResults(newInput)
    if (this.searchComponent.current) {
      this.searchComponent.current.focus()
    }
  })

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
    count: state.colors.search.count,
    suggestions: state.colors.search.suggestions,
    loading: state.colors.search.loading,
    error: state.colors.search.error,
    query: state.colors.search.query
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    clearSearch: () => {
      dispatch(clearSearch())
    },
    loadSearchResults: (query: string, family?: string) => {
      dispatch(loadSearchResults(query))
    },
    addToLivePalette: (color) => {
      dispatch(add(color))
    },
    updateSearchQuery: (query) => {
      dispatch(updateSearchQuery(query))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
