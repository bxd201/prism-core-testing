import React, { useEffect, useMemo, useState } from 'react'
import useEffectAfterMount from '../../hooks/useEffectAfterMount'
import { Color, SwatchRenderer } from '../../types'
import GenericMessage, { MessageTypes } from '../generic-message/generic-message'
import GenericOverlay from '../generic-overlay/generic-overlay'
import SearchBar from '../search-bar/search-bar'
import SearchResults from '../search-results/search-results'

const defaultMessages = {
  searchPlaceholder: 'What color are you looking for?',
  title: '',
  cancel: 'CANCEL'
}

type SearchMessages = Partial<typeof defaultMessages>

export interface SearchProps {
  results: Color[]
  isLoading: boolean
  query: string
  setQuery: (value: string) => void
  messages?: SearchMessages
  minimal?: boolean
  height?: number
  showCancel?: boolean
  showBack?: boolean
  onClickCancel?: () => void
  onClickBack?: () => void
  loadingContent?: JSX.Element
  searchPromptContent?: JSX.Element
  noResultsContent?: JSX.Element
  subtitleContent?: JSX.Element
  swatchRenderer?: SwatchRenderer
}

const Search: React.FC<SearchProps> = ({
  height = 475,
  isLoading,
  loadingContent,
  messages,
  noResultsContent,
  minimal,
  onClickBack,
  onClickCancel,
  query,
  results = [],
  searchPromptContent,
  setQuery,
  showBack = false,
  showCancel = true,
  subtitleContent,
  swatchRenderer
}) => {
  const [hasSearched, updateHasSearched] = useState(!results.length)

  useEffectAfterMount(() => {
    if (results.length || isLoading) {
      updateHasSearched(true)
    }
  }, [results, isLoading])

  useEffect(() => {
    if (!query?.length) {
      updateHasSearched(false)
    }
  }, [query])

  const messageContent = { ...defaultMessages, ...messages }

  const loadingOverlay = (
    <GenericOverlay type={GenericOverlay.TYPES.LOADING} semitransparent>
      {loadingContent ?? 'Searching'}
    </GenericOverlay>
  )

  const searchPrompt = (
    <GenericMessage type={MessageTypes.NORMAL}>
      {searchPromptContent ?? 'Enter a color name, number, or family in the text field above.'}
    </GenericMessage>
  )

  const noResultsMessage = (
    <GenericMessage type={MessageTypes.WARNING}>{noResultsContent ?? 'Sorry, no color matches found.'}</GenericMessage>
  )

  const titleContent = messageContent.title ? (
    <h6 className='border-b mx-4 mt-4 pb-2 text-lg font-bold'>{messageContent.title}</h6>
  ) : undefined

  const subtitleWrapper = !!results.length && <div className='mx-4 mt-4'>{subtitleContent}</div>

  // useMemo prevents unnecessary re-renders of SearchResults
  const searchMessage = useMemo((): JSX.Element => {
    if (isLoading) {
      return loadingOverlay
    }

    if (hasSearched && !results.length) {
      return noResultsMessage
    }

    return searchPrompt
  }, [isLoading, hasSearched, results])

  return (
    <div>
      <SearchBar
        value={query}
        setValue={setQuery}
        cancelMessage={messageContent.cancel}
        placeholder={messageContent.searchPlaceholder}
        showCancelButton={showCancel}
        showBackButton={showBack}
        onClickBack={onClickBack}
        onClickCancel={onClickCancel}
        minimal={minimal}
      />
      {titleContent}
      {subtitleWrapper}
      <SearchResults results={isLoading ? [] : results} swatchRenderer={swatchRenderer}>
        <div style={{ height: height }} className='flex justify-center items-center'>
          {searchMessage}
        </div>
      </SearchResults>
    </div>
  )
}

export default Search
