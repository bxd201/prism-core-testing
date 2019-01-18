// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import ReactGA from 'react-ga'

import { SCENE_VARIANTS } from 'constants/globals'

import './SceneVariantSwitch.scss'
type SwitchProps = {
  onChange: Function,
  currentVariant: string
}

function SceneVariantSwitch () {}

SceneVariantSwitch.DayNight = class DayNight extends PureComponent<SwitchProps> {
  static name = 'day-night-toggle'
  static classes = {
    BASE: 'scene-variant-switch-day-night',
    CHECKBOX: 'visually-hidden',
    DAY: 'scene-variant-switch-day-night__day',
    SWITCH: 'scene-variant-switch-day-night__switch',
    NIGHT: 'scene-variant-switch-day-night__night'
  }
  static isCompatible (variants: string[]): boolean {
    return variants.indexOf(SCENE_VARIANTS.DAY) > -1 && variants.indexOf(SCENE_VARIANTS.NIGHT) > -1
  }

  constructor (props: SwitchProps) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  render () {
    const { currentVariant } = this.props

    const isDay = currentVariant === SCENE_VARIANTS.DAY

    return (
      <FormattedMessage id={isDay ? 'TO_NIGHT_VIEW' : 'TO_DAY_VIEW'}>
        {(txt: string) => (
          <label className={`${SceneVariantSwitch.DayNight.classes.BASE} ${!isDay ? `${SceneVariantSwitch.DayNight.classes.BASE}--night` : ''}`}
            onKeyDown={this.handleKeyDown}
            role='button'
            title={txt}
            aria-label={txt}
            htmlFor={DayNight.name}
            tabIndex='0'>
            <input className={SceneVariantSwitch.DayNight.classes.CHECKBOX} type='checkbox' checked={!isDay} name={DayNight.name} id={DayNight.name} onChange={this.handleChange} />
            <FontAwesomeIcon className={`${SceneVariantSwitch.DayNight.classes.DAY} ${isDay ? `${SceneVariantSwitch.DayNight.classes.DAY}--active` : ''}`} icon={[isDay ? 'fas' : 'fal', 'sun']} />
            <div className={`${SceneVariantSwitch.DayNight.classes.SWITCH} ${!isDay ? `${SceneVariantSwitch.DayNight.classes.SWITCH}--on` : ''}`} />
            <FontAwesomeIcon className={`${SceneVariantSwitch.DayNight.classes.NIGHT} ${!isDay ? `${SceneVariantSwitch.DayNight.classes.NIGHT}--active` : ''}`} icon={[isDay ? 'fal' : 'fas', 'moon']} />
          </label>
        )}
      </FormattedMessage>
    )
  }

  handleChange = function handleChange () {
    if (this.props.currentVariant === SCENE_VARIANTS.DAY) {
      this.props.onChange(SCENE_VARIANTS.NIGHT)
      ReactGA.event({
        category: 'Scene Manager',
        action: 'View Night Scene',
        label: 'View Night Scene'
      })
    } else {
      this.props.onChange(SCENE_VARIANTS.DAY)
    }
  }

  handleKeyDown = function handleKeyDown (e: KeyboardEvent) {
    // if enter or space...
    if (e.keyCode === 32 || e.keyCode === 13) {
      e.stopPropagation()
      e.preventDefault()
      // ... act as though we've changed the checkbox
      this.handleChange()
    }
  }
}

export default SceneVariantSwitch
