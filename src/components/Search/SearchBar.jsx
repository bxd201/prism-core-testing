/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import ButtonBar from '../GeneralButtons/ButtonBar/ButtonBar'
import { FormattedMessage, useIntl } from 'react-intl'
import uniqueId from 'lodash/uniqueId'
import debounce from 'lodash/debounce'
import './SearchBar.scss'
import 'src/scss/convenience/visually-hidden.scss'
import { loadSearchResults, MIN_SEARCH_LENGTH } from 'src/store/actions/loadSearchResults'
import at from 'lodash/at'
import { compareKebabs } from 'src/shared/helpers/StringUtils'
import recursiveDecodeURIComponent from 'src/shared/utils/recursiveDecodeURIComponent.util'

type Props = {
  label: string,
  limitSearchToFamily?: boolean,
  showCancelButton?: boolean,
  showIcon?: boolean,
  showLabel?: boolean
}

const SearchBar = (props: Props) => {
  const {
    label,
    limitSearchToFamily = false,
    showCancelButton = true,
    showIcon = true,
    showLabel = true
  } = props
  const [id] = useState(uniqueId('SearchBarInput'))
  const [inputValue, setInputValue] = useState<string>('')
  const [newSearchParam, setNewSearchParam] = useState<string>('')
  const { messages = {} } = useIntl()
  const { section, family, query = '' } = useParams()
  const { structure } = useSelector(state => state.colors)
  const currentSearchParam = useRef('')
  const dispatch = useDispatch()
  const history = useHistory()
  const inputRef = useRef()

  useEffect(() => {
    // recursively decode incoming query and use it to update input value
    setInputValue(recursiveDecodeURIComponent(query))
  }, [query])

  useEffect(() => {
    // whenever inputValue changes we need to check if the value meets our requirements for searching
    checkIfSearchableInput(inputValue)

    return () => {
      checkIfSearchableInput(null, true)
    }
  }, [inputValue])

  const checkIfSearchableInput = useCallback(debounce((value: string | null = '', abort: boolean = false) => {
    // this is for "cancelling" the debounced method if we unmount before execution
    if (abort) { return }

    // if value is empty or it matches our current search param... return out
    if (typeof value !== 'string' || !value.trim().length || currentSearchParam.current === value) { return }

    // if value doe not meet minimum searchable length... return out
    if (value.length < MIN_SEARCH_LENGTH) { return }

    // IMPORTANT: need to double encode in order to preserve encoding in URL
    // if we do NOT do this, we run into decoding issues when retrieving the URL via react router
    history.push(encodeURIComponent(encodeURIComponent(value)))

    // set ref for current search that we can use to prevent duplicate searches
    currentSearchParam.current = value

    // set new search param which we will actually perform a search on
    setNewSearchParam(value)
  }, 500), [])

  useEffect(() => {
    // if the new search param is empty, do not proceed
    if (typeof newSearchParam !== 'string' || newSearchParam.trim().length === 0) { return }

    // at this point we're now sending off the search based on a set of conditions
    if (limitSearchToFamily) {
      if (family) {
        dispatch(loadSearchResults(newSearchParam, family))
        return
      }

      if (section) {
        const familiesFromSection = structure.filter(v => compareKebabs(v.name, section)).map(v => v.families)

        if (familiesFromSection && familiesFromSection.length === 1) {
          dispatch(loadSearchResults(newSearchParam, familiesFromSection[0]))
          return
        }
      }
    }

    dispatch(loadSearchResults(newSearchParam))
  }, [newSearchParam, family, section, limitSearchToFamily])

  return (
    <div className='SearchBar'>
      <form onSubmit={e => e.preventDefault()} className='SearchBar__search-form'>
        <label className={`SearchBar__label ${!showLabel ? 'visually-hidden' : ''}`} htmlFor={id}>{label}</label>
        <div className='SearchBar__inner'>
          {showIcon && (<label htmlFor={id} className='SearchBar__icon'>
            <FontAwesomeIcon icon={['fal', 'search']} size='lg' />
          </label>)}
          <div className={`SearchBar__wrapper SearchBar__wrapper--with${query ? '-outline' : 'out-outline'}`}>
            <input
              className='SearchBar__input'
              id={id}
              onChange={e => setInputValue(e.target.value)}
              placeholder={at(messages, 'SEARCH.SEARCH_BY')[0]}
              ref={inputRef}
              value={inputValue}
            />
            {inputValue.length > 0 &&
              <button type='button' className='SearchBar__clean' onClick={() => {
                setInputValue('')
                inputRef.current && inputRef.current.focus()
              }}>
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

export default SearchBar
