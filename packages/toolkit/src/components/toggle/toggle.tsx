// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import uniqueId from 'lodash/uniqueId'
import { CustomIcon } from '../../types'

export interface ToggleSwitchProps {
  isOnInitial?: boolean // 0 means first element selected, 1 means the second is selected
  handleToggle: (isOn: number) => void
  currentColor?: string
  itemList: [CustomIcon, CustomIcon]
  textColor?: string
}

export const TEST_ID = 'toggle-test'
export const TEST_ID_ICON_0 = `${TEST_ID}_ICON_0`
export const TEST_ID_ICON_1 = `${TEST_ID}_ICON_1`
export const TEST_ID_CHECK = `${TEST_ID}_CHECK`
export const TEST_ID_CHECK_LABEL = `${TEST_ID_CHECK}_LABEL`

function Toggle(props: ToggleSwitchProps): JSX.Element {
  const { isOnInitial, handleToggle, currentColor, itemList, textColor } = props
  const [checkboxName] = useState(uniqueId('toggle-switch'))
  const [isOn, setIsOn] = useState(isOnInitial ? 1 : 0)

  const handleChange = (e: React.FormEvent<HTMLInputElement>): void => {
    const toggleState = isOn === 0 ? 1 : 0
    setIsOn(toggleState)
    handleToggle(toggleState)
  }

  return (
    <div
      data-testid={TEST_ID}
      className='flex pt-[6px] pr-[15px] pb-[6px] pl-[15px] text-black bg-white mt-[0] mr-[4px] mb-[0] ml-[4px]'
      style={currentColor && textColor ? { background: currentColor, color: `${textColor}` } : null}
    >
      <div data-testid={TEST_ID_ICON_0} className='flex flex-col items-center m-auto pr-[10px]'>
        {itemList[0].icon ? (
          <FontAwesomeIcon icon={itemList[0].icon} size='lg' style={textColor ? { color: `${textColor}` } : null} />
        ) : null}
        {itemList[0]?.label}
      </div>
      <input
        data-testid={TEST_ID_CHECK}
        checked={!!isOn}
        onChange={handleChange}
        className='h-0 w-0 invisible'
        name={checkboxName}
        id={checkboxName}
        type='checkbox'
        aria-label='toggle-switch-label'
      />
      <label
        data-testid={TEST_ID_CHECK_LABEL}
        className='flex items-center justify-between cursor-pointer w-[45px] min-w-[45px] h-[27px] m-auto bg-white border border-b rounded-[100px] relative transition background-color duration-500'
        title='toggle-switch-label'
        aria-label='toggle-switch-label'
        style={{ background: !isOnInitial ? currentColor : textColor, borderColor: textColor }}
        htmlFor={checkboxName}
      >
        <span
          className={`absolute top-[1px]  ${
            isOn ? 'left-[calc(50%_-_3px)]' : 'left-[1px]'
          } w-[24px] h-[23px] bg-white border border-b rounded-[100px] shadow-[0_0_10px_0_rgba(10, 10, 10, 0.29)] transition duration-500`}
          style={currentColor && textColor ? { background: currentColor, color: `${textColor}` } : null}
        />
      </label>
      <div data-testid={TEST_ID_ICON_1} className='flex flex-col items-center m-auto pl-[10px]'>
        {itemList[1].icon ? (
          <FontAwesomeIcon icon={itemList[1].icon} size='lg' style={textColor ? { color: `${textColor}` } : null} />
        ) : null}
        {itemList[1]?.label}
      </div>
    </div>
  )
}

export default Toggle
