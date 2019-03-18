// @flow
import React, { PureComponent } from 'react'
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

function SceneVariantSwitch () {}

SceneVariantSwitch.DayNight = class DayNight extends PureComponent<SwitchProps> {
  static name = 'day-night-toggle'
  static classes = {
    BASE: 'scene-variant-switch-day-night',
    CHECKBOX: 'visually-hidden',
    WRAPPER: 'scene-variant-switch-day-night__wrapper',
    DAY: 'scene-variant-switch-day-night__day',
    SWITCH: 'scene-variant-switch-day-night__switch',
    NIGHT: 'scene-variant-switch-day-night__night'
  }
  static isCompatible (variants: string[]): boolean {
    return includes(variants, SCENE_VARIANTS.DAY) && includes(variants, SCENE_VARIANTS.NIGHT)
  }

  constructor (props: SwitchProps) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  render () {
    const { currentVariant, sceneId } = this.props
    const checkboxName = `${DayNight.name}${sceneId}`
    const isDay = currentVariant === SCENE_VARIANTS.DAY

    return (
      <FormattedMessage id={isDay ? 'TO_NIGHT_VIEW' : 'TO_DAY_VIEW'}>
        {(txt: string) => (
          <label className={`${SceneVariantSwitch.DayNight.classes.BASE} ${!isDay ? `${SceneVariantSwitch.DayNight.classes.BASE}--night` : ''}`}
            onKeyDown={this.handleKeyDown}
            role='button'
            title={txt}
            aria-label={txt}
            htmlFor={checkboxName}
            tabIndex='0'>
            <input className={SceneVariantSwitch.DayNight.classes.CHECKBOX} type='checkbox' checked={!isDay} name={checkboxName} id={checkboxName} onChange={this.handleChange} />
            <div className={`${SceneVariantSwitch.DayNight.classes.WRAPPER} ${isDay ? `${SceneVariantSwitch.DayNight.classes.WRAPPER}--active` : ''}`}>
              <FontAwesomeIcon className={`${SceneVariantSwitch.DayNight.classes.DAY} ${!isDay ? `${SceneVariantSwitch.DayNight.classes.DAY}--active` : ''}`} icon={['fa', 'sun']} />
            </div>
            <div className={`${SceneVariantSwitch.DayNight.classes.WRAPPER} ${SceneVariantSwitch.DayNight.classes.WRAPPER}--night ${!isDay ? `${SceneVariantSwitch.DayNight.classes.WRAPPER}--active` : ''}`}>
              <FontAwesomeIcon className={`${SceneVariantSwitch.DayNight.classes.NIGHT} ${!isDay ? `${SceneVariantSwitch.DayNight.classes.NIGHT}--active` : ''}`} icon={['fa', 'moon-stars']} />
            </div>
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
      }, ['GAtrackerPRISM'])
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
