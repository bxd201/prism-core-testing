import React from 'react'
import { Meta, Story } from '@storybook/react'
import { exampleResults } from './exampleResults'
import SearchResults, { SearchResultsProps } from './search-results'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  title: 'SearchResults',
  component: SearchResults
} as Meta<SearchResultsProps>

const children1 = <p>Children!</p>

const Template = (args): JSX.Element => <SearchResults {...args} />

export const Primary: Story<SearchResultsProps> = Template.bind({})
Primary.args = {
  results: exampleResults,
  children: children1
}
