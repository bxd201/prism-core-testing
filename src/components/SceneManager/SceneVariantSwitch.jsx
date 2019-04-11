// @flow
import React, { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import ReactGA from 'react-ga'
import includes from 'lodash/includes'

import { SCENE_VARIANTS } from 'constants/globals'

import './SceneVariantSwitch.scss'

type SwitchProps = {
  onChange: Function,
  currentVariant: string,
  sceneId: number
}

const NAME = 'day-night-toggle'
const CLASSES = {
  BASE: 'scene-variant-switch-day-night',
  CHECKBOX: 'visually-hidden',
  WRAPPER: 'scene-variant-switch-day-night__wrapper',
  DAY: 'scene-variant-switch-day-night__day',
  SWITCH: 'scene-variant-switch-day-night__switch',
  NIGHT: 'scene-variant-switch-day-night__night'
}

function SceneVariantSwitch () {}

function DayNight (props: SwitchProps) {
  const { currentVariant, sceneId, onChange } = props
  const checkboxName = `${NAME}${sceneId}`
  const isDay = currentVariant === SCENE_VARIANTS.DAY

  const toggle = useCallback(() => {
    if (currentVariant === SCENE_VARIANTS.DAY) {
      onChange(SCENE_VARIANTS.NIGHT)
      ReactGA.event({
        category: 'Scene Manager',
        action: 'View Night Scene',
        label: 'View Night Scene'
      }, ['GAtrackerPRISM'])
    } else {
      onChange(SCENE_VARIANTS.DAY)
    }
  }, [currentVariant])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === 32 || e.keyCode === 13) {
      e.stopPropagation()
      e.preventDefault()
      // ... act as though we've changed the checkbox
      toggle()
    }
  }, [currentVariant])

  return (
    <FormattedMessage id={isDay ? 'TO_NIGHT_VIEW' : 'TO_DAY_VIEW'}>
      {(txt: string) => (
        <label className={`${CLASSES.BASE} ${!isDay ? `${CLASSES.BASE}--night` : ''}`}
          onKeyDown={handleKeyDown}
          role='button'
          title={txt}
          aria-label={txt}
          htmlFor={checkboxName}
          tabIndex='0'>
          <input className={CLASSES.CHECKBOX} type='checkbox' checked={!isDay} name={checkboxName} id={checkboxName} onChange={toggle} />
          <div className={`${CLASSES.WRAPPER} ${isDay ? `${CLASSES.WRAPPER}--active` : ''}`}>
            <FontAwesomeIcon className={`${CLASSES.DAY} ${!isDay ? `${CLASSES.DAY}--active` : ''}`} icon={['fa', 'sun']} />
          </div>
          <div className={`${CLASSES.WRAPPER} ${CLASSES.WRAPPER}--night ${!isDay ? `${CLASSES.WRAPPER}--active` : ''}`}>
            <FontAwesomeIcon className={`${CLASSES.NIGHT} ${!isDay ? `${CLASSES.NIGHT}--active` : ''}`} icon={['fa', 'moon-stars']} />
          </div>
        </label>
      )}
    </FormattedMessage>
  )
}

DayNight.isCompatible = (variants: string[]): boolean => {
  return includes(variants, SCENE_VARIANTS.DAY) && includes(variants, SCENE_VARIANTS.NIGHT)
}

SceneVariantSwitch.DayNight = DayNight

export default SceneVariantSwitch
