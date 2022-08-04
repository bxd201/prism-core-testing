// @flow
import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { SCENE_VARIANTS } from '../../constants/globals'

import './DayNightToggle.scss'

const baseClassName = 'day-night-toggle'
const checkBoxClassName = `${baseClassName}__input visually-hidden`
const wrapperClassName = `${baseClassName}__wrapper`
const dayClassName = `${baseClassName}__day`
const nightClassName = `${baseClassName}__night`

type DayNightToggleProps = {
  sceneUid: string,
  toggle: Function,
  currentVariant: string
}

function DayNightToggle (props: DayNightToggleProps) {
  const { sceneUid, toggle, currentVariant } = props
  const checkboxName = `day-night-toggle-${sceneUid}`

  const [isDay, setIsDay] = useState(currentVariant === SCENE_VARIANTS.DAY)

  useEffect(() => {
    setIsDay(currentVariant === SCENE_VARIANTS.DAY)
  }, [currentVariant])

  return (<FormattedMessage id={isDay ? 'TO_NIGHT_VIEW' : 'TO_DAY_VIEW'}>
    {(txt: string) => <>
      <label
        className={`${baseClassName} ${!isDay ? `${baseClassName}--night` : ''}`}
        title={txt}
        aria-label={txt}
        htmlFor={checkboxName}
      >
        <input
          aria-label={txt}
          className={checkBoxClassName}
          type='checkbox'
          checked={!isDay}
          name={checkboxName}
          id={checkboxName}
          onChange={toggle}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              toggle()
            }
          }}
        />
        <div className={`${wrapperClassName} ${isDay ? `${wrapperClassName}--active` : ''}`}>
          <FontAwesomeIcon className={`${dayClassName} ${!isDay ? `${dayClassName}--active` : ''}`} icon={['fa', 'sun']} />
        </div>
        <div className={`${wrapperClassName} ${wrapperClassName}--night ${!isDay ? `${wrapperClassName}--active` : ''}`}>
          <FontAwesomeIcon className={`${nightClassName} ${!isDay ? `${nightClassName}--active` : ''}`} icon={['fa', 'moon-stars']} />
        </div>
      </label>
    </>}
  </FormattedMessage>)
}

export default DayNightToggle
