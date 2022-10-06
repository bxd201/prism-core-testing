import React from 'react'
import { faMoon, faSun } from '@fortawesome/pro-solid-svg-icons'
import Toggle, { ToggleSwitchProps } from './toggle'

const Template = (args: ToggleSwitchProps): JSX.Element => {
  const { handleToggle, isOnInitial, itemList } = args
  return <Toggle isOnInitial={isOnInitial} handleToggle={handleToggle} itemList={itemList} />
}

export const Default = Template.bind({})

Default.args = {
  isOnInitial: false,
  itemList: [
    { icon: faSun, label: 'day' },
    { icon: faMoon, label: 'night' }
  ],
  handleToggle: (isOn: number) => console.log(`Toggle is: ${isOn ? 'NIGHT' : 'DAY'}`)
}

export default {
  title: 'Elements/Toggle',
  component: Toggle,
  argTypes: {
    isOnInitial: { control: 'boolean' }
  }
}
