// @flow
import React, { useCallback } from 'react'
import { getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch, useSelector } from 'react-redux'
import { add } from '../../store/actions/live-palette'
import some from 'lodash/some'
import './ColorPalette.scss'

type colorPaletteProps = {
  palette: Object
}

const baseClass = 'color-palette'
const wrapper = `${baseClass}__wrapper`
const colorInfo = `${baseClass}__color-info`
const colorInfoNumber = `${colorInfo}__number`
const colorInfoName = `${colorInfo}__name`
const checkCircle = `${baseClass}__check-circle`
const toggleCheckIcons = `${baseClass}__toggle-check-icons`
const colorsUl = `${wrapper}__colors-ul`
const colorLi = `${wrapper}__color-li`

const ColorPalette = ({ palette }: colorPaletteProps) => {
  const dispatch = useDispatch()
  const colorsCurrentlyInLivePalette = useSelector(state => state.lp.colors)
  const mouseDownHandler = (e: SyntheticEvent) => {
    e.preventDefault()
  }
  const clickHandler = useCallback((e: SyntheticEvent) => {
    const color = palette.find((color) => (color.colorNumber === e.currentTarget.dataset.colornumber))
    if (color) dispatch(add(color))
  }, [dispatch, palette])

  return (
    <div className={`${wrapper}`}>
      {palette && <ul className={`${colorsUl}`}>
        {
          palette.map((color: Object, index: number) => {
            return (
              <li className={`${colorLi}`} key={`color-${index}`} style={{ backgroundColor: `rgb(${color.red},${color.green},${color.blue})` }}>
                <div className={`${colorInfo}`}>
                  <span className={`${colorInfoNumber}`}>SW {color.colorNumber}</span>
                  <span className={`${colorInfoName}`}>SW {color.name}</span>
                </div>
                <div className={`${checkCircle}`}>
                  <button data-colornumber={`${color.colorNumber}`} aria-label={`Add ${color.name} to palette`} className={`${toggleCheckIcons}`} tabIndex={some(colorsCurrentlyInLivePalette, color) ? -1 : 0} onClick={clickHandler} onMouseDown={mouseDownHandler}>
                    <FontAwesomeIcon
                      size='2x'
                      style={{ color: getContrastYIQ(color.hex) }}
                      icon={some(colorsCurrentlyInLivePalette, color) ? ['fa', 'check-circle'] : ['fal', 'plus-circle']}
                    />
                  </button>
                </div>
              </li>
            )
          })
        }
      </ul>}
    </div>
  )
}

export default ColorPalette
