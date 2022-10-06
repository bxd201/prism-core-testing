import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import SearchBar, { SearchBarProps } from './search-bar'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  title: 'Components/SearchBar',
  component: SearchBar,
  args: {
    label: 'Search',
    placeholder: 'What color are you looking for?',
    showBackButton: true,
    showIcon: true,
    showLabel: false
  },
  argTypes: {
    onClickBack: {
      action: 'back clicked'
    },
    setValue: {
      action: 'value set'
    },
    value: {
      type: 'string'
    },
    minimal: {
      type: 'boolean'
    }
  }
} as Meta<SearchBarProps>

const Template = (args): JSX.Element => <SearchBar {...args} />

export const Primary: Story<SearchBarProps> = Template.bind({})
Primary.args = {
  showCancelButton: true,
  showLabel: false
}

export const NoSearchIcon: Story<SearchBarProps> = Template.bind({})
NoSearchIcon.args = {
  showIcon: false,
  value: 'A search query'
}
