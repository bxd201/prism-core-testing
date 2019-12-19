/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import ButtonBar from '../GeneralButtons/ButtonBar/ButtonBar'
import { FormattedMessage } from 'react-intl'
import uniqueId from 'lodash/uniqueId'
import debounce from 'lodash/debounce'
import './SearchBar.scss'
import 'src/scss/convenience/visually-hidden.scss'
import { MIN_SEARCH_LENGTH } from '../../store/actions/loadSearchResults'

type Props = {
  showCancelButton: boolean,
  showLabel?: boolean,
  showIcon?: boolean,
  label: string,
  placeholder?: string
}

export default (props: Props) => {
  const {
    label,
    placeholder,
    showCancelButton = true,
    showIcon = true,
    showLabel = true
  } = props
  const { query = '' } = useParams()
  const history = useHistory()
  const [value, setValue] = React.useState(query)
  const [id] = React.useState(uniqueId('SearchBarInput'))
  const updateUrl = React.useMemo(() => debounce((value, abort = false) => {
    // this is for "cancelling" the debounced method if we unmount before execution
    if (abort) {
      return
    }

    if (typeof value === 'string') {
      const l = value.length
      if (l >= MIN_SEARCH_LENGTH) {
        // ensure we aren't pushing anything dangerous into the URL
        const v = encodeURIComponent(value)

        // if this is a new search query...
        if (value !== query) {
          // ... push it to the URL
          history.push(v)
        } else {
          // ... otherwise just replace the current URL with it
          // this enables searching on initial load w/ a search param
          history.replace(v)
        }
      } else if (l === 0 && value !== query) {
        // this allows us to escape via routing if the user clears their search
        // don't allow if query is already blank -- doing it then auto-pushes a blank state on initial load
        history.push('./')
      }
    }
  }, 250), [query])

  React.useEffect(() => { // mutate url when input hasn't changed in 250ms
    updateUrl(value)

    return () => {
      updateUrl(null, true)
    }
  }, [value])

  return (
    <div className='SearchBar'>
      <form onSubmit={e => e.preventDefault()} className='SearchBar__search-form'>
        <label className={`SearchBar__label ${!showLabel ? 'visually-hidden' : ''}`} htmlFor={id}>{label}</label>
        <div className='SearchBar__inner'>
          {showIcon && (<label htmlFor={id} className='SearchBar__icon'>
            <FontAwesomeIcon icon={['fal', 'search']} size='lg' />
          </label>)}
          <div className={`SearchBar__wrapper SearchBar__wrapper--with${query ? '-outline' : 'out-outline'}`}>
            <input id={id} value={value} className='SearchBar__input' onChange={e => setValue(e.target.value)} placeholder={placeholder} />
            {value.length > 0 &&
              <button type='button' className='SearchBar__clean' onClick={() => setValue('')}>
                <FontAwesomeIcon icon={['fas', 'times']} />
              </button>}
          </div>
          {showCancelButton && <div className='SearchBar__cancel-button'>
            <ButtonBar.Bar>
              <ButtonBar.Button to='../'>
                <FormattedMessage id='CANCEL' />
              </ButtonBar.Button>
            </ButtonBar.Bar>
          </div>}
        </div>
      </form>
    </div>
  )
}
