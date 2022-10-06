import React, { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import useEffectAfterMount from '../../hooks/useEffectAfterMount'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import { Color } from '../../types'
import Search, { SearchProps } from './search'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  title: 'Experiences/Search',
  component: Search,
  argTypes: {
    title: {
      type: 'string'
    },
    subtitle: {
      type: 'string'
    },
    placeholder: {
      type: 'string'
    },
    showBack: {
      type: 'boolean'
    },
    showCancel: {
      type: 'boolean'
    },
    onClickBack: {
      action: 'onClickBack'
    },
    onClickCancel: {
      action: 'onClickCancel'
    }
  },
  args: {
    placeholder: 'What color are you looking for?'
  }
} as Meta<SearchProps>

const MockedSearch = (args): JSX.Element => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Color[]>([])
  const [isLoading, setLoading] = useState(false)

  // mock searching function
  const getResults = async (query: string): Promise<Color[]> => {
    setLoading(true)

    const filteredColors: Color[] = colors.filter((color: Color) => {
      return (
        color.name.toLowerCase().includes(query.toLowerCase()) ||
        color.colorNumber.toLowerCase().includes(query.toLowerCase())
      )
    })

    return await new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false)
        resolve(filteredColors)
      }, 1000) // simulate 1 second delay for search results
    })
  }

  useEffectAfterMount(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      getResults(query)
        .then((searchResults) => {
          setResults(searchResults)
        })
        .catch(() => setResults([]))
    }, 500) // delay before performing search

    return () => clearTimeout(timer)
  }, [query])

  const subtitleContent = <p>{args.subtitle}</p>

  return (
    <Search
      query={query}
      setQuery={setQuery}
      results={results}
      isLoading={isLoading}
      subtitleContent={subtitleContent}
      messages={{ title: args.title, searchPlaceholder: args.placeholder }}
      {...args}
    />
  )
}

const Template = (args): JSX.Element => <MockedSearch {...args} />

export const Primary: Story<SearchProps> = Template.bind({})
Primary.args = {}

export const WithTitle: Story = Template.bind({})
WithTitle.args = {
  title: 'Example Title',
  subtitle: 'Example subtitle message.'
}
