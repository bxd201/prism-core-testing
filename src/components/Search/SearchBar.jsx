/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React, { useState, useEffect, useCallback, useRef, useContext } from 'react'
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
import { compareKebabs } from 'src/shared/helpers/StringUtils'
import recursiveDecodeURIComponent from 'src/shared/utils/recursiveDecodeURIComponent.util'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { PubSubCtx } from 'src/facetSupport/facetPubSub'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'

type Props = {
  className?: 'SearchBarLight' | 'SearchBarMinimal',
  label?: string,
  limitSearchToFamily?: boolean,
  onClickBackButton?: () => void,
  placeholder?: string,
  showBackButton?: boolean,
  showCancelButton?: boolean,
  showIcon?: boolean,
  showLabel?: boolean
}

const SearchBar = (props: Props) => {
  const {
    className,
    label,
    limitSearchToFamily = false,
    onClickBackButton,
    placeholder,
    showBackButton = false,
    showCancelButton = true,
    showIcon = true,
    showLabel = true
  } = props
  const [id] = useState(uniqueId('SearchBarInput'))
  const [inputValue, setInputValue] = useState<string>('')
  const [newSearchParam, setNewSearchParam] = useState<string>('')
  const { locale } = useIntl()
  const { section, family, query = '' } = useParams()
  const { structure } = useSelector(state => state.colors)
  const currentSearchParam = useRef('')
  const dispatch = useDispatch()
  const history = useHistory()
  const inputRef = useRef()
  const { brandId } = useContext(ConfigurationContext)
  const { subscribe } = useContext(PubSubCtx)

  useEffect(() => {
    subscribe('prism-focus-color-search-bar', () => {
      setTimeout(() => { inputRef.current && inputRef.current.focus() }, 150)
    })
  }, [])

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
    const _current = currentSearchParam.current || ''
    const _value = value || ''

    // this is for "cancelling" the debounced method if we unmount before execution
    if (abort || typeof value !== 'string' || _current === _value) { return }

    // NOTE: must check for intentional emptiness from clearing a search before subsequent checks
    // for no-value string or too-short searches in order to maintain this functionality

    // if value is empty AND our previous search is a non-empty string  ...
    if (_value === '' && _current.length > 0) {
      // this means we've cleared a search and should return out
      history.push('./')
      return
    }

    // if input is just a bunch of spaces... return out
    if (_value.trim() === '') { return }

    // if value doe not meet minimum searchable length... return out
    if (_value.length < MIN_SEARCH_LENGTH) { return }

    // IMPORTANT: need to double encode in order to preserve encoding in URL
    // if we do NOT do this, we run into decoding issues when retrieving the URL via react router
    history.push(encodeURIComponent(encodeURIComponent(_value)))

    // set ref for current search that we can use to prevent duplicate searches
    currentSearchParam.current = _value

    // set new search param which we will actually perform a search on
    setNewSearchParam(_value)

    GA.event({ category: 'QR Color Wall Search', action: 'Search Queries', label: _value }, GA_TRACKER_NAME_BRAND[brandId])
  }, 500), [])

  useEffect(() => {
    // if the new search param is empty, do not proceed
    if (typeof newSearchParam !== 'string' || newSearchParam.trim().length === 0) { return }

    // at this point we're now sending off the search based on a set of conditions
    if (limitSearchToFamily) {
      if (family) {
        dispatch(loadSearchResults(brandId, { language: locale }, newSearchParam, family))
        return
      }

      if (section) {
        const familiesFromSection = structure.filter(v => compareKebabs(v.name, section)).map(v => v.families)

        if (familiesFromSection && familiesFromSection.length === 1) {
          dispatch(loadSearchResults(brandId, { language: locale }, newSearchParam, familiesFromSection[0]))
          return
        }
      }
    }

    dispatch(loadSearchResults(brandId, { language: locale }, newSearchParam))
  }, [newSearchParam, family, section, limitSearchToFamily])

  const getClassName = (name, subClass) => name ? name + subClass : ''

  return (
    <div className={`SearchBar ${getClassName(className, '')}`}>
      <form onSubmit={e => e.preventDefault()} className='SearchBar__search-form'>
        <label className={`SearchBar__label ${!showLabel ? 'visually-hidden' : ''}`} htmlFor={id}>{label}</label>
        <div className='SearchBar__inner'>
          {showBackButton && (
            <button type='button' className={`${getClassName(className, '__back')}`} onClick={onClickBackButton}>
              <FontAwesomeIcon icon={['fal', 'angle-left']} size='lg' />
            </button>
          )}
          {showIcon && (
            <label htmlFor={id} className={`SearchBar__icon ${getClassName(className, '__icon')}`}>
              <FontAwesomeIcon icon={['fal', 'search']} size='lg' />
            </label>
          )}
          <div className={`SearchBar__wrapper SearchBar__wrapper--with${query ? '-outline' : 'out-outline'} ${getClassName(className, '__wrapper')}`}>
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className={`SearchBar__input ${getClassName(className, '__input')}`}
              id={id}
              onChange={e => setInputValue(e.target.value)}
              placeholder={placeholder}
              ref={inputRef}
              value={inputValue}
            />
            {inputValue.length > 0 &&
              <button type='button' className='SearchBar__clean' onClick={() => {
                setInputValue('')
                inputRef.current && inputRef.current.focus()
              }}>
                <FontAwesomeIcon icon={['fal', 'times']} />
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
