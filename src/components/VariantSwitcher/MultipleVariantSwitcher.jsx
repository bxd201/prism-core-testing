// @flow
import React, { useState, useEffect, useMemo } from 'react'
import RadioBtnSwitch from './RadioBtnSwitch'
import ToggleSwitch from './ToggleSwitch'
import { mostReadable } from '@ctrl/tinycolor'

type SwitchProps = {
  onChange: Function,
  sceneId: number,
  activeVariantIndex: Number,
  currentColor: string,
  iconType: String,
  variantsList: Array
}

const MultipleVariantSwitcher = (props: SwitchProps) => {
  const [isToggled, setIsToggled] = useState(false)
  const { currentColor, sceneId, activeVariantIndex, onChange, iconType, variantsList } = props

  useEffect(() => {
    if (variantsList?.length === 2) {
      setIsToggled(activeVariantIndex === 1)
    }
  }, [activeVariantIndex])

  const isToggle = () => {
    // ToDO also check if icons valid or not
    if (variantsList?.length === 2) {
      return true
    }
    return false
  }

  const handleToggle = () => {
    const newIndex = (activeVariantIndex === 0) ? 1 : 0
    onChange(newIndex)
  }

  const handleRadioSwitch = (e) => {
    onChange(e.target.value)
  }

  const color = useMemo(() => {
    if (currentColor) {
      return mostReadable(currentColor, [ 'white', 'black' ])
    }
    return 'white'
  }, [ currentColor ])

  return (
    <>
      {isToggle()
        ? <ToggleSwitch
          sceneId={sceneId}
          isOn={isToggled}
          variantsList={variantsList}
          iconType={iconType}
          handleToggle={handleToggle}
          currentColor={currentColor}
          textColor={color}
        />
        : <RadioBtnSwitch
          currentColor={currentColor}
          activeVariantIndex={activeVariantIndex}
          variantsList={variantsList}
          iconType={iconType}
          onChange={handleRadioSwitch}
          textColor={color}
        />
      }
    </>
  )
}

export default MultipleVariantSwitcher
