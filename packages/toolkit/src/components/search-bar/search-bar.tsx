import React, { useEffect, useState } from 'react'
import { faAngleLeft, faSearch, faTimes } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import uniqueId from 'lodash/uniqueId'
import useEffectAfterMount from '../../hooks/useEffectAfterMount'

export interface SearchBarProps {
  minimal?: boolean
  label?: string
  name?: string
  cancelMessage?: string
  onClickBack?: () => void
  onClickCancel?: () => void
  value: string
  setValue: (value: string) => void
  placeholder?: string
  showBackButton?: boolean
  showCancelButton?: boolean
  showIcon?: boolean
  showLabel?: boolean
}

const SearchBar = ({
  minimal = false,
  label = 'Search',
  name = 'search',
  onClickBack,
  cancelMessage,
  onClickCancel,
  value,
  setValue,
  placeholder,
  showBackButton = false,
  showCancelButton = false,
  showIcon = true,
  showLabel = false
}: SearchBarProps): JSX.Element => {
  const [id] = useState(uniqueId('SearchBarInput'))
  const [searchValue, setSearchValue] = useState<string>('')

  useEffectAfterMount(() => {
    setValue(searchValue)
  }, [setValue, searchValue])

  useEffect(() => {
    setSearchValue(value)
  }, [value])

  const resetSearch = (): void => {
    setSearchValue('')
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value)
  }

  const backButton = showBackButton && (
    <button type='button' className={`mr-2`} onClick={onClickBack} aria-label='back'>
      <FontAwesomeIcon icon={faAngleLeft} size='lg' />
    </button>
  )

  const cancelButton = showCancelButton && (
    <button
      type='button'
      className={`font-semibold ml-2 h-full px-2 rounded ${
        minimal
          ? 'bg-none text-black text-base border-none hover:bg-buttonActiveBgColor hover:text-buttonActiveColor'
          : 'bg-buttonColor text-white text-xs'
      } `}
      onClick={onClickCancel}
    >
      {cancelMessage}
    </button>
  )

  const icon = showIcon && (
    <label htmlFor={id} className={`mr-2`}>
      <FontAwesomeIcon icon={faSearch} size='lg' />
    </label>
  )

  const clearButton = searchValue?.length > 0 && (
    <button type='button' className='absolute right-0 h-full aspect-square' onClick={resetSearch} aria-label='clear'>
      <FontAwesomeIcon icon={faTimes} />
    </button>
  )

  return (
    <div className={`flex bg-white`}>
      <form onSubmit={(e) => e.preventDefault()} className='w-full'>
        <label className={`${showLabel && label ? '' : 'hidden'} font-bold text-sm`} htmlFor={id}>
          {label}
        </label>
        <div className='flex m-2 h-11 sm:h-9 items-center'>
          {backButton}
          {icon}
          <div
            className={`relative flex-auto h-full border-2 border-primary rounded ${minimal ? 'border-slate-300' : ''}`}
          >
            <input
              autoFocus
              className={`w-full h-full indent-2 text-neutral-700 ${minimal ? 'font-semibold' : ''}`}
              id={id}
              name={name}
              onChange={onChange}
              placeholder={placeholder}
              value={searchValue}
            />
            {clearButton}
          </div>
          {cancelButton}
        </div>
      </form>
    </div>
  )
}

export default SearchBar
