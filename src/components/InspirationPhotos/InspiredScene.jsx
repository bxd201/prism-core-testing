// @flow
import React from 'react'
import ColorsFromImage from './ColorsFromImage'

type InspiredProps = { data: Object, isActivedPage: boolean }

export default ({ isActivedPage, data }: InspiredProps) => (
  <div className='scene__image__wrapper'>
    <ColorsFromImage isActivedPage={isActivedPage} data={data} />
  </div>
)
