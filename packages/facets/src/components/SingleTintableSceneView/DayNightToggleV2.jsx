// @flow
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SCENE_VARIANTS } from '../../constants/globals'
import './DayNightToggleV2.scss'

type DayNightToggleV2Props = {
  sceneUid: string,
  variantName: string,
  changeHandler: Function
}

const baseClassName = 'day-night-toggle-v2'
const toggleLabel = `${baseClassName}__label`
const inputToggle = `${baseClassName}__input`
const toggleSwitch = `${baseClassName}__toggle-switch`
const toggleBg = `${toggleSwitch}__bg`

const getDayNightText = (variantName, getText) => {
  const textKey = variantName === SCENE_VARIANTS.DAY ? 'TO_NIGHT_VIEW' : 'TO_DAY_VIEW'

  return getText({ id: textKey })
}

function DayNightToggleV2 (props: DayNightToggleV2Props) {
  const { sceneUid, variantName, changeHandler } = props
  const { formatMessage } = useIntl()
  const toggleName = `${sceneUid}-toggle`
  const [isDay, setIsDay] = useState(variantName === SCENE_VARIANTS.DAY)
  const [toggleText, setToggleText] = useState(getDayNightText(variantName, formatMessage))

  useEffect(() => {
    const valueIsDay = variantName === SCENE_VARIANTS.DAY
    setIsDay(valueIsDay)
    setToggleText(getDayNightText(variantName, formatMessage))
  }, [variantName])

  return (<div className={baseClassName}>
    <label
      className={toggleLabel}
      htmlFor={toggleName}
      title={toggleText}
      aria-label={toggleText}>
      <input
        aria-label={toggleText}
        className={inputToggle}
        checked={isDay}
        type={'checkbox'}
        id={toggleName}
        name={toggleName}
        onChange={changeHandler}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            changeHandler()
          }
        }} />
      <div className={`${toggleSwitch}${isDay ? '' : '--night'}`}>
        <FontAwesomeIcon
          icon={['fa', 'sun']} />
      </div>
      <div className={`${toggleBg}${isDay ? '' : '--night'}`}>
        <FontAwesomeIcon
          icon={['fa', 'moon']} /></div>
    </label>
  </div>)
}

export default DayNightToggleV2
