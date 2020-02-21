// @flow
import React, { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { FormattedMessage } from 'react-intl'
import * as GA from 'src/analytics/GoogleAnalytics'
import includes from 'lodash/includes'

import { SCENE_VARIANTS } from 'constants/globals'

import './SceneVariantSwitch.scss'
import 'src/scss/convenience/visually-hidden.scss'

type SwitchProps = {
  onChange: Function,
  currentVariant: string,
  sceneId: number
}

export const NAME = 'day-night-toggle'
export const CLASSES = {
  BASE: 'scene-variant-switch-day-night',
  CHECKBOX: 'scene-variant-switch-day-night__input visually-hidden',
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
    const newVariant = (currentVariant === SCENE_VARIANTS.DAY) ? SCENE_VARIANTS.NIGHT : SCENE_VARIANTS.DAY
    GA.event({
      category: 'Scene Manager',
      action: `View ${newVariant} Scene`,
      label: `View ${newVariant} Scene`
    })
    onChange(newVariant)
  }, [currentVariant])

  return (
    <FormattedMessage id={isDay ? 'TO_NIGHT_VIEW' : 'TO_DAY_VIEW'}>
      {(txt: string) => <>
        {/* eslint-disable-next-line jsx-a11y/label-has-for */}
        <label
          className={`${CLASSES.BASE} ${!isDay ? `${CLASSES.BASE}--night` : ''}`}
          title={txt}
          aria-label={txt}
          htmlFor={checkboxName}
        >
          <input
            className={CLASSES.CHECKBOX}
            type='checkbox'
            checked={!isDay}
            name={checkboxName}
            id={checkboxName}
            onChange={toggle}
            onKeyDown={event => event.key === 'Enter' && toggle()}
          />
          <div className={`${CLASSES.WRAPPER} ${isDay ? `${CLASSES.WRAPPER}--active` : ''}`}>
            <FontAwesomeIcon className={`${CLASSES.DAY} ${!isDay ? `${CLASSES.DAY}--active` : ''}`} icon={['fa', 'sun']} />
          </div>
          <div className={`${CLASSES.WRAPPER} ${CLASSES.WRAPPER}--night ${!isDay ? `${CLASSES.WRAPPER}--active` : ''}`}>
            <FontAwesomeIcon className={`${CLASSES.NIGHT} ${!isDay ? `${CLASSES.NIGHT}--active` : ''}`} icon={['fa', 'moon-stars']} />
          </div>
        </label>
      </>}
    </FormattedMessage>
  )
}

DayNight.isCompatible = (variants: string[]): boolean => {
  return includes(variants, SCENE_VARIANTS.DAY) && includes(variants, SCENE_VARIANTS.NIGHT)
}

SceneVariantSwitch.DayNight = DayNight

export default SceneVariantSwitch
