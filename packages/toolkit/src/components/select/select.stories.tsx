import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoonStars, faMoonCloud, faSunHaze, faSunCloud, faSunrise } from '@fortawesome/pro-solid-svg-icons'
import Select from './select'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'

const _options = [
  { text: 'day', icon: faSun },
  { text: 'night', icon: faMoonStars },
  { text: 'moon cloud', icon: faMoonCloud },
  { text: 'sun haze', icon: faSunHaze },
  { text: 'sun cloud', icon: faSunCloud },
  { text: 'sunrise', icon: faSunrise }
]

interface TemplateProps { backgroundColor: string; options: string[]; initialOption?: number }
const Template = ({ backgroundColor, options, initialOption }: TemplateProps): JSX.Element => (
  <Select
    initialOption={initialOption}
    options={_options.filter(({ text }) => options.some((opt) => opt === text))}
    optionRenderer={({ text, icon }) => (
      <span className='flex m-2'>
        <FontAwesomeIcon icon={icon} size='lg' />
        <span className='ml-2 capitalize'>{text}</span>
      </span>
    )}
    style={{ backgroundColor }}
  />
)

export const WithBackgroundColor = Template.bind({})
WithBackgroundColor.args = {
  backgroundColor: (colorOptions[getRandomColorName()] || colorOptions['A La Mode']).hex,
  options: _options.map((opt) => opt.text)
}
export const WithoutBackgroundColor = Template.bind({})
WithoutBackgroundColor.args = { options: _options.map((opt) => opt.text) }

export default {
  title: 'Select',
  component: Select,
  argTypes: {
    initialOption: {
      control: false,
      description: 'the option to be selected initially when component is first loaded'
    },
    options: {
      options: _options.map((opt) => opt.text),
      control: { type: 'inline-check' },
      description:
        'an array of options data, each item is passed to the optionRenderer for it to create an option Element'
    },
    backgroundColor: {
      control: { type: 'color' },
      description: 'storybook control for setting style.backgroundColor on component'
    },
    style: { table: { disable: true } },
    className: { table: { disable: true } }
  }
}
