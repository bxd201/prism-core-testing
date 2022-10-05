// @flow
import React from 'react'
import 'src/scss/convenience/clickable.scss'
import './StyledFileBtn.scss'

type StyleFileBtn = {
  id: string,
  text: string
}

const baseClass = 'StyledFileBtn'

const StyledFileBtn = (props: StyleFileBtn) => {
  const { id, text } = props

  return (
    <>
      <label htmlFor={id}
        tabIndex='-1'
        className={`${baseClass} clickable`}>
        <span className={`${baseClass}__text`}>
          {text}
        </span>
      </label>
    </>
  )
}

export default StyledFileBtn
