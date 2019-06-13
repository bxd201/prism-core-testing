// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/pro-light-svg-icons'

import './SearchBar.scss'

type Props = {
  onSearchInput: Function,
  onClearSearch?: Function
}

type State = {
  focus: boolean,
  cleanVisible: boolean,
  text: string
}

const baseClass = 'SearchBar'
const MIN_CHARS_RUN_SEARCH = 3

export default class SearchBar extends PureComponent<Props, State> {
  // these are method names of SearchBar class instances exposed via its ref
  static API = {
    focus: 'doFocus',
    setValue: 'setValue'
  }

  state: State = {
    focus: false,
    text: '',
    cleanVisible: false
  }

  searchInput: RefObject

  constructor (props: Props) {
    super(props)

    this.searchInput = React.createRef()
    this.doFocus = this.doFocus.bind(this)
    this.setValue = this.setValue.bind(this)
  }

  render () {
    const { focus, text, cleanVisible } = this.state
    const outline = focus ? 'with-outline' : 'without-outline'

    return (
      <div className={`${baseClass}`}>
        <FontAwesomeIcon className='search-icon' icon={faSearch} size='lg' />
        <div className={`${baseClass}__wrapper ${baseClass}__wrapper--${outline}`}>
          <input
            value={text}
            ref={this.searchInput}
            className={`${baseClass}__input`}
            onChange={this.handleInput} />
          {
            cleanVisible &&
            <button type='button' onClick={this.cleanInput} className={`${baseClass}__clean`}>
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
    const hasAnyInput = value.length > 0
    const newState = {
      text: value,
      focus: hasAnyInput,
      cleanVisible: hasAnyInput
    }

    e.persist()

    this.setState(newState, () => {
      if (value.length >= MIN_CHARS_RUN_SEARCH) {
        onSearchInput(value)
      }
    })
  }

  cleanInput = () => {
    const { onClearSearch } = this.props
    this.setState({ focus: false, text: '', cleanVisible: false }, () => {
      if (onClearSearch) {
        onClearSearch()
      }
    })
  }

  doFocus = () => {
    this.searchInput.current.focus()
  }

  setValue = (text: string, searchAfterUpdate: boolean) => {
    const { onSearchInput } = this.props

    this.setState({
      focus: true,
      text,
      cleanVisible: true
    }, () => {
      if (searchAfterUpdate && text.length >= MIN_CHARS_RUN_SEARCH) {
        onSearchInput(text)
      }
    })
  }
}
