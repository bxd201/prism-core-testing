// @flow
import React from 'react'

import './Propper.scss'

type Props = {
  children: any,
  propSize?: string,
  vPosition?: string
}

const Propper = ({ children, propSize = '100%', vPosition }: Props) => {
  return <div className='Propper'>
    <div className='Propper__prop' style={{ paddingTop: propSize }} />
    <div className={`Propper__content ${vPosition || ''}`}>
      {children}
    </div>
  </div>
}

Propper.V_POSITION = {
  BOTTOM: 'Propper__content--v-btm',
  CENTER: 'Propper__content--v-center',
  TOP: 'Propper__content--v-top'
}

export default Propper
