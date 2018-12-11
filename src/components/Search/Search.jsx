// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { loadSearchResults } from '../../actions/loadSearchResults'
import { add } from '../../actions/live-palette'
import { debounce } from 'lodash'
import ColorWallSwatchList from '../Facets/ColorWall/ColorWallSwatchList'
import { type Color } from '../../shared/types/Colors'

import './Search.scss'

type Props = {
  colors: Array<any>,
  loadSearchResults: Function,
  addToLivePalette: Function
}

type State = {
  activeColor?: Color
}

function keyById (colors) {
  return colors.reduce((acc, { id }) => acc + id, '')
}

const SEARCH_DELAY = 500

class Search extends PureComponent<Props, State> {
  static baseClass = 'prism-search'

  state = {
    activeColor: void (0)
  }

  constructor (props) {
    super(props)

    this.handleActivateColor = this.handleActivateColor.bind(this)
  }

  handleActivateColor = function handleActivateColor (color: Color) {
    this.setState({
      activeColor: color
    })
  }

  performSearch = debounce(value => {
    this.props.loadSearchResults(value)
  }, SEARCH_DELAY)

  clearActiveColor = debounce(() => {
    this.setState({
      activeColor: void (0)
    })
  }, SEARCH_DELAY, {
    leading: true,
    trailing: false
  })

  handleSearchInput (value: string) {
    this.clearActiveColor()
    this.performSearch(value)
  }

  handleInput = e => {
    e.persist()

    if (e.target.value.length) {
      this.handleSearchInput(e.target.value)
    }
  }

  handleSubmit = e => {
    e.preventDefault()
  }

  render () {
    const { colors, addToLivePalette } = this.props
    const { activeColor } = this.state

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
            {activeColor ? (
              <ColorWallSwatchList
                bloomRadius={2}
                onAddColor={addToLivePalette}
                cellSize={50}
                key={keyById(colors)}
                colors={colors}
                initialActiveColor={activeColor} />
            ) : (
              <ColorWallSwatchList
                showAll
                immediateSelectionOnActivation
                cellSize={50}
                key={`${keyById(colors)}-showAll`}
                colors={colors}
                onActivateColor={this.handleActivateColor} />
            )}
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
