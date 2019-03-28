// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import debounce from 'lodash/debounce'

import { loadSearchResults } from '../../store/actions/loadSearchResults'
import { add } from '../../store/actions/live-palette'
import ColorWallSwatch from '../Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'
import { type Color } from '../../shared/types/Colors'

import './Search.scss'

type Props = {
  colors: Array<any>,
  loadSearchResults: Function,
  addToLivePalette: Function
}

type State = {
  resultSwatchSize: number // TODO: watch for resize and adjust this accordingly to maintain desired range of sizes
}

const SEARCH_DELAY = 500

export class Search extends PureComponent<Props, State> {
  static baseClass = 'prism-search'

  state = {
    resultSwatchSize: 175
  }

  constructor (props: Props) {
    super(props)

    this.cellRenderer = this.cellRenderer.bind(this)
  }

  performSearch = debounce((value: string) => {
    this.props.loadSearchResults(value)
  }, SEARCH_DELAY)

  handleSearchInput (value: string) {
    this.performSearch(value)
  }

  handleInput = (e: SyntheticInputEvent<HTMLInputElement>) => {
    e.persist()

    if (e.target.value.length) {
      this.handleSearchInput(e.target.value)
    }
  }

  handleSubmit = (e: SyntheticInputEvent<HTMLInputElement>) => {
    e.preventDefault()
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
    const thisColor: Color = colors[index]

    if (!thisColor) {
      return null
    }

    return (
      <div key={key} style={style}>
        <ColorWallSwatch showContents onAdd={addToLivePalette} color={thisColor} />
      </div>
    )
  }

  render () {
    const { colors } = this.props
    const { resultSwatchSize } = this.state

    return (
      <div className={Search.baseClass}>
        <form onSubmit={this.handleSubmit}>
          <input
            type='search'
            placeholder='Color name, number, or family'
            className={`${Search.baseClass}__input`}
            onInput={this.handleInput} />
        </form>

        {!colors.length
          ? <p>'Enter a color name, number or family in the text field above.'</p>
          : <div className='color-wall-wall'>

            <AutoSizer>
              {({ height, width }) => {
                const columnCount = Math.round(width / resultSwatchSize)
                const rowCount = Math.ceil(colors.length / columnCount)
                const newSize = width / columnCount

                return (
                  <Grid
                    _forceUpdateProp={colors}
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
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    colors: state.colors.searchResults
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadSearchResults: (family) => {
      dispatch(loadSearchResults(family))
    },
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
