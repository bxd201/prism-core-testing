// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/pro-light-svg-icons'

type State = {
    type: boolean,
    cleanVisible: boolean,
    text: String
  }
export default class SearchBar extends PureComponent<Props, State> {
    static baseClass = 'prism-search'
    state: State = {
      focus: false,
      text: '',
      cleanVisible: false
    }
    handleInput = (e: SyntheticInputEvent<HTMLInputElement>) => {
      const { handleSearchInput } = this.props
      e.persist()
      this.setState({ text: e.target.value })
      if (e.target.value.length > 0) {
        this.setState({ focus: true, cleanVisible: true })
        if (e.target.value.length > 2) {
          handleSearchInput(e.target.value)
        }
      } else {
        this.setState({ focus: false, cleanVisible: false })
      }
    }
    cleanInput = () => {
      const { handleSearchInput } = this.props
      this.setState({ focus: false, text: '', cleanVisible: false }, () => {
        handleSearchInput(this.state.text)
      })
    }
    render () {
      const { focus, text, cleanVisible } = this.state
      const outline = focus ? 'with__outline' : 'without__outline'
      return (
        <div className={`search-bar-wrapper`}>
          <FontAwesomeIcon className='search-icon' icon={faSearch} size='lg' />
          <div className={`${SearchBar.baseClass}__search-bar ${SearchBar.baseClass}__search-bar__${outline}`}>
            <input
              focus='text'
              value={text}
              className={`${SearchBar.baseClass}__search-bar__input`}
              onChange={this.handleInput} />
            {
              cleanVisible &&
              <button onClick={this.cleanInput}>
                <FontAwesomeIcon className={`${SearchBar.baseClass}__search-bar__clean`} icon={['fas', 'times']} />
              </button>
            }
          </div>
        </div>
      )
    }
}
