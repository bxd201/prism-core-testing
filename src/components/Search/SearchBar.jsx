// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/pro-light-svg-icons'

import './SearchBar.scss'

type OwnProps = {
  onSearchInput: Function,
  onClearSearch: Function,
  value: string | void
}

type Ref = {
  forwardedRef?: RefObject
}

type Props = OwnProps & Ref

const baseClass = 'SearchBar'

export class SearchBar extends PureComponent<Props> {
  render () {
    const { value, onClearSearch, forwardedRef } = this.props
    const _value = typeof value === 'string' ? value : ''
    const hasInput = !!_value
    const outline = hasInput ? 'with-outline' : 'without-outline'

    return (
      <div className={`${baseClass}`}>
        <FontAwesomeIcon className='search-icon' icon={faSearch} size='lg' />
        <div className={`${baseClass}__wrapper ${baseClass}__wrapper--${outline}`}>
          <input
            value={value}
            ref={forwardedRef}
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
}

// $FlowIgnore -- flow's mad about this ref for some reason.
const WrappedSearchBar = React.forwardRef<OwnProps, SearchBar>((props, ref) => <SearchBar {...props} forwardedRef={ref} />)

export default WrappedSearchBar
