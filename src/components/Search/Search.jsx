// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { loadSearchResults } from '../../actions/loadSearchResults'
import { debounce } from 'lodash'
import ColorWallSwatch from '../Facets/ColorWall/ColorWallSwatch'

import './Search.scss'

type Props = {
  colors: Array<any>,
  loadSearchResults: Function
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

  render () {
    const { colors } = this.props

    return (
      <div className={Search.baseClass}>
        <form>
          <input
            type='search'
            className={`${Search.baseClass}__input`}
            onInput={this.handleInput} />
        </form>

        {!colors.length
          ? <p>'Enter a color name, number or family in the text field above.'</p>
          : colors.map(color => (
            <ColorWallSwatch
              key={color.id}
              color={color}
            />
          ))
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
