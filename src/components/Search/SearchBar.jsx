// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/pro-light-svg-icons'

import './SearchBar.scss'

type Props = {
  onSearchInput: Function,
  onClearSearch: Function,
  value: string | void
}

const baseClass = 'SearchBar'

export default class SearchBar extends PureComponent<Props> {
  // these are method names of SearchBar class instances exposed via its ref
  static API = {
    focus: 'doFocus',
    setValue: 'setValue'
  }

  searchInput: RefObject

  constructor (props: Props) {
    super(props)

    this.searchInput = React.createRef()
    this.doFocus = this.doFocus.bind(this)
  }

  render () {
    const { value, onClearSearch } = this.props
    const _value = typeof value === 'string' ? value : ''
    const hasInput = !!_value
    const outline = hasInput ? 'with-outline' : 'without-outline'

    return (
      <div className={`${baseClass}`}>
        <FontAwesomeIcon className='search-icon' icon={faSearch} size='lg' />
        <div className={`${baseClass}__wrapper ${baseClass}__wrapper--${outline}`}>
          <input
            value={value}
            ref={this.searchInput}
            className={`${baseClass}__input`}
            onChange={this.handleInput} />
          {
            hasInput && onClearSearch &&
            <button type='button' onClick={onClearSearch} className={`${baseClass}__clean`}>
              <FontAwesomeIcon icon={['fas', 'times']} />
            </button>
          }
        </div>
      </div>
    )
  }

  handleInput = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { onSearchInput } = this.props
    const value = e.target.value

    e.persist()

    onSearchInput(value)
  }

  doFocus = () => {
    this.searchInput.current.focus()
  }
}
