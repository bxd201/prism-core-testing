/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import ButtonBar from '../GeneralButtons/ButtonBar/ButtonBar'
import { FormattedMessage } from 'react-intl'
import uniqueId from 'lodash/uniqueId'
import './SearchBar.scss'
import 'src/scss/convenience/visually-hidden.scss'

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

  React.useEffect(() => { value !== query && setValue(query) }, [query])

  React.useEffect(() => { // mutate url when input hasn't changed in 250ms
    const id = setTimeout(() => value !== query && history.push(value || './'), 250)
    return () => clearTimeout(id)
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
            {value.length > 1 &&
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
