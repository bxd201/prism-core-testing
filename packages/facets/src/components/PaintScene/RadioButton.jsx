// @flow
import React from 'react'
import { KEY_CODES } from 'src/constants/globals'

type Props = {
  triggerSetBrushShapeSize: Function,
  value: string,
  ariaLabel: string,
  id: string,
  isSelected: boolean,
  className: string,
  enableBrushType: Function,
  brushTypeName: string
}

const RadioButton = React.forwardRef((props: Props, ref) => {
  const keyDownHandler = (e: SyntheticEvent) => {
    if (e.keyCode === KEY_CODES.KEY_CODE_ARROW_RIGHT || e.keyCode === KEY_CODES.KEY_CODE_ARROW_DOWN) {
      e.preventDefault()
      props.enableBrushType(true, ref)
    } else if (e.keyCode === KEY_CODES.KEY_CODE_ARROW_LEFT || e.keyCode === KEY_CODES.KEY_CODE_ARROW_UP) {
      e.preventDefault()
      props.enableBrushType(false, ref)
    }
  }

  const changeHandler = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    props.triggerSetBrushShapeSize()
  }

  const clickHandler = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    props.triggerSetBrushShapeSize()
  }

  return (<div>
    <label ref={ref} aria-label={props.ariaLabel} aria-checked={props.isSelected} onKeyDown={keyDownHandler} tabIndex={props.isSelected ? '0' : '-1'} className={props.className} htmlFor={props.id} role='radio' onClick={clickHandler}>
      <input name={`${props.brushTypeName}brush`} tabIndex='-1' className={'visually-hidden'} id={props.id} onChange={changeHandler} value={props.value} type='radio' checked={props.isSelected} />
    </label>
  </div>)
})

export default RadioButton
