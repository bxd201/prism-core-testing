/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React, { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDetectOutsideClick } from './useDetectOutsideClick'
import './RadioBtnSwitch.scss'
import { capitalize } from 'lodash'

type RadioBtnSwitchProps = {
    currentColor: String,
    activeVariantIndex: Number,
    onChange: Function,
    variantsList: Array,
    textColor: string,
    iconType: String,
}

export const CLASSES = {
  BASE: 'radio-btn-switch',
  VARIANTS_LIST: 'radio-btn-switch__variants-list',
  VARIANTS_ACTIVE: 'radio-btn-switch__variants-active',
  VARIANT_WRAPPER: 'radio-btn-switch__variant-wrapper',
  VARIANT_BUTTON: 'radio-btn-switch__button',
  BUTTON_ICON: 'radio-btn-switch__button--icon'
}

const RadioBtnSwitch = ({ activeVariantIndex, currentColor, variantsList, onChange, textColor, iconType }: RadioBtnSwitchProps) => {
  const dropdownRef = useRef(null)
  const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef, false)
  const onBtnClick = () => setIsActive(!isActive)
  return (
    <>
      <div className={CLASSES.BASE}>
        <nav
          ref={dropdownRef}
          className={`${CLASSES.VARIANTS_LIST} ${isActive && `${CLASSES.VARIANTS_ACTIVE}`}`}
          style={{ background: currentColor }}
        >
          <ul>
            {variantsList && variantsList.map((variant, index) =>
              <li key={index}>
                <div onChange={onChange}
                  className={CLASSES.VARIANT_WRAPPER}
                  style={{
                    background: currentColor,
                    color: textColor,
                    border: index === activeVariantIndex && `1px solid ${textColor}`,
                    borderRadius: index === activeVariantIndex && '4px'
                  }}
                >
                  <input
                    type='radio'
                    id={index}
                    value={index}
                    checked={index === activeVariantIndex}
                  />
                  {variant?.label &&
                    <label
                      htmlFor={variant.label}
                      style={{
                        filter: index === activeVariantIndex && `drop-shadow(1px 1px 1px ${textColor})`
                      }}>
                      {capitalize(variant.label)}
                    </label>}
                  {variant?.icon &&
                    <FontAwesomeIcon
                      icon={[`${iconType}`, `${variant.icon}`]}
                      size='lg'
                      style={{
                        margin: '2px',
                        filter: index === activeVariantIndex && `drop-shadow(0px 0px 1px ${textColor})`
                      }} />}
                </div>
              </li>
            )}
          </ul>
        </nav>
        <button onClick={onBtnClick} className={CLASSES.VARIANT_BUTTON} style={{ background: currentColor, color: textColor }}>
          <span>VARIANTS</span>
          <FontAwesomeIcon
            className={CLASSES.BUTTON_ICON}
            icon={[`fas`, 'chevron-up']}
            size='lg'
            style={{ transform: isActive && 'rotate(180deg)' }} />
        </button>
      </div>
    </>
  )
}

export default RadioBtnSwitch
