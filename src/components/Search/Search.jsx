// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { loadSearchResults } from '../../actions/loadSearchResults'
import { debounce } from 'lodash'
import ColorWallSwatchList from '../Facets/ColorWall/ColorWallSwatchList'

import './Search.scss'

type Props = {
  colors: Array<any>,
  loadSearchResults: Function
}

function keyById (colors) {
  return colors.reduce((acc, { id }) => acc + id, '')
}

class Search extends PureComponent<Props> {
  static baseClass = 'prism-search'

  handleSearchInput = debounce(value => {
    this.props.loadSearchResults(value)
  }, 500)

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
    const { colors } = this.props

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
          : <ColorWallSwatchList key={keyById(colors)} colors={colors} />
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
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
