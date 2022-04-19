import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoonStars } from '@fortawesome/pro-solid-svg-icons'
import Toggle from './toggle'
import { getLuminosity } from '../../utils/utils'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'

interface TemplateProps {
  backgroundColor: string
  onToggle: (boolean) => void
  initialChecked: boolean
}

const Template = ({ backgroundColor, ...otherProps }: TemplateProps): JSX.Element => {
  const Option = ({ icon, label }: any): JSX.Element => (
    <span className='flex flex-col items-center'>
      <FontAwesomeIcon icon={icon} size='lg' />
      {label}
    </span>
  )

  return (
    <Toggle
      {...otherProps}
      uncheckedOptionRenderer={() => <Option icon={faSun} label='day' />}
      checkedOptionRenderer={() => <Option icon={faMoonStars} label='night' />}
      // pass-through props
      className={`${getLuminosity(backgroundColor) > 55 ? 'text-white' : 'text-black'}`}
      style={{ backgroundColor }}
    />
  )
}

export const WithBackgroundColor = Template.bind({})
WithBackgroundColor.args = {
  backgroundColor: (colorOptions[getRandomColorName()] || colorOptions['A La Mode']).hex,
  initialChecked: false
}

export const WithoutBackgroundColor = Template.bind({})

export default {
  title: 'Toggle',
  component: Toggle,
  argTypes: {
    // actual props
    backgroundColor: { control: 'color' },
    uncheckedOptionRenderer: { table: { disable: true } },
    checkedOptionRenderer: { table: { disable: true } },
    // actions
    onToggle: { action: 'toggle', table: { disable: true } }
  }
}
